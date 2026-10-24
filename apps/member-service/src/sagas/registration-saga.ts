import crypto from 'node:crypto';
import { executeWithRetry } from '@kineticfit/resilience';

export type SagaState = 'STARTED' | 'COMPLETED' | 'COMPENSATED' | 'FAILED';

export interface RegistrationInput {
  name: string;
  email: string;
  rfidUid: string;
  tier: 'STANDARD' | 'PRO' | 'ELITE_BLACK';
  orgId: string;
  hubId: string;
}

export interface SagaStep {
  name: string;
  execute: () => Promise<void>;
  compensate: () => Promise<void>;
}

export class RegistrationSagaCoordinator {
  public state: SagaState = 'STARTED';
  public currentStepIndex: number = 0;
  public completedSteps: string[] = [];
  public compensatedSteps: string[] = [];
  public sagaId: string;

  constructor() {
    this.sagaId = crypto.randomUUID();
  }

  public async execute(steps: SagaStep[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.currentStepIndex = i;

      try {
        await executeWithRetry(async () => {
          await step.execute();
        }, { maxRetries: 2, baseMs: 10, maxMs: 50 });
        this.completedSteps.push(step.name);
      } catch (err: any) {
        // Step failed -> initiate backward compensations
        this.state = 'FAILED';
        await this.rollback(steps.slice(0, i));
        this.state = 'COMPENSATED';
        throw new Error(`Saga step '${step.name}' failed: ${err.message}. Compensated.`);
      }
    }

    this.state = 'COMPLETED';
  }

  private async rollback(executedSteps: SagaStep[]): Promise<void> {
    // Reverse order compensation
    for (let i = executedSteps.length - 1; i >= 0; i--) {
      const step = executedSteps[i];
      try {
        await step.compensate();
        this.compensatedSteps.push(step.name);
      } catch (compErr: any) {
        console.error(`Compensation error on step ${step.name}:`, compErr);
      }
    }
  }
}
