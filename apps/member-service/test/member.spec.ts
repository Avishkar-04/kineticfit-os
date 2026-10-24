import { describe, it, expect } from 'vitest';
import { MemberRegistry } from '../src/queries/member-queries.js';
import { RegistrationSagaCoordinator, SagaStep } from '../src/sagas/registration-saga.js';

describe('Member Service Suite', () => {
  describe('Member Registry & Keyset Pagination', () => {
    it('should query members with search and return keyset cursor', () => {
      const registry = new MemberRegistry();
      registry.initialize([
        { id: 'uuid-1', memberNo: 'KF-1001', name: 'Aria Sterling', email: 'aria@test.com', rfidUid: '04:A1', tier: 'PRO', status: 'ACTIVE', adherencePercentage: 90, joinedAt: '2026-01-01' },
        { id: 'uuid-2', memberNo: 'KF-1002', name: 'Marcus Vance', email: 'marcus@test.com', rfidUid: '04:A2', tier: 'ELITE_BLACK', status: 'ACTIVE', adherencePercentage: 95, joinedAt: '2026-01-02' },
        { id: 'uuid-3', memberNo: 'KF-1003', name: 'David Kim', email: 'david@test.com', rfidUid: '04:A3', tier: 'STANDARD', status: 'EXPIRING', adherencePercentage: 80, joinedAt: '2026-01-03' }
      ]);

      const result = registry.query({ limit: 2 });
      expect(result.items.length).toBe(2);
      expect(result.nextCursor).toBe('uuid-2');

      const nextResult = registry.query({ cursor: result.nextCursor!, limit: 2 });
      expect(nextResult.items.length).toBe(1);
      expect(nextResult.items[0].id).toBe('uuid-3');
    });

    it('should look up member by RFID UID', () => {
      const registry = new MemberRegistry();
      registry.save({
        id: 'uuid-10',
        memberNo: 'KF-1010',
        name: 'Elena Rostova',
        email: 'elena@test.com',
        rfidUid: '04:99:88:77',
        tier: 'PRO',
        status: 'ACTIVE',
        adherencePercentage: 100,
        joinedAt: '2026-01-01'
      });

      const found = registry.findByRfid('04:99:88:77');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Elena Rostova');
    });
  });

  describe('Distributed Registration Saga with Compensations', () => {
    it('should execute all steps successfully and transition to COMPLETED', async () => {
      const saga = new RegistrationSagaCoordinator();
      const executionTrail: string[] = [];

      const steps: SagaStep[] = [
        {
          name: 'step1',
          execute: async () => { executionTrail.push('exec1'); },
          compensate: async () => { executionTrail.push('comp1'); }
        },
        {
          name: 'step2',
          execute: async () => { executionTrail.push('exec2'); },
          compensate: async () => { executionTrail.push('comp2'); }
        }
      ];

      await saga.execute(steps);
      expect(saga.state).toBe('COMPLETED');
      expect(executionTrail).toEqual(['exec1', 'exec2']);
      expect(saga.completedSteps).toEqual(['step1', 'step2']);
    });

    it('should trigger backward compensations upon failure and rollback executed steps', async () => {
      const saga = new RegistrationSagaCoordinator();
      const executionTrail: string[] = [];

      const steps: SagaStep[] = [
        {
          name: 'create_auth_user',
          execute: async () => { executionTrail.push('auth_user_created'); },
          compensate: async () => { executionTrail.push('auth_user_disabled'); }
        },
        {
          name: 'bind_rfid',
          execute: async () => { executionTrail.push('rfid_bound'); },
          compensate: async () => { executionTrail.push('rfid_released'); }
        },
        {
          name: 'initial_payment_charge',
          execute: async () => {
            throw new Error('Card payment declined by processor');
          },
          compensate: async () => { executionTrail.push('payment_voided'); }
        }
      ];

      await expect(saga.execute(steps)).rejects.toThrow('Card payment declined');
      expect(saga.state).toBe('COMPENSATED');

      // Compensations must execute in reverse order for previously completed steps: bind_rfid then create_auth_user
      expect(executionTrail).toEqual([
        'auth_user_created',
        'rfid_bound',
        'rfid_released',
        'auth_user_disabled'
      ]);
      expect(saga.compensatedSteps).toEqual(['bind_rfid', 'create_auth_user']);
    });
  });
});
