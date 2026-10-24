import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { Role } from '@kineticfit/contracts';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'override_lockdown' | 'bypass_turnstile';
export type Subjects =
  | 'all'
  | 'Member'
  | 'ClassSession'
  | 'Booking'
  | 'DietProtocol'
  | 'Invoice'
  | 'TurnstileGate'
  | 'System'
  | 'AuditLog';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export interface UserContext {
  id: string;
  role: Role;
  orgId: string;
  hubId: string;
}

export function defineAbilityFor(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user.role === 'SUPERADMIN') {
    can('manage', 'all');
  } else if (user.role === 'OPS_DIRECTOR') {
    can('manage', 'Member');
    can('manage', 'ClassSession');
    can('manage', 'Booking');
    can('manage', 'DietProtocol');
    can('read', 'Invoice');
    can('manage', 'TurnstileGate');
    can('override_lockdown', 'TurnstileGate');
    can('bypass_turnstile', 'TurnstileGate');
    can('read', 'System');
    can('read', 'AuditLog');
  } else if (user.role === 'FRONT_DESK') {
    can('read', 'Member');
    can('create', 'Member');
    can('read', 'ClassSession');
    can('create', 'Booking');
    can('bypass_turnstile', 'TurnstileGate');
  } else if (user.role === 'TRAINER') {
    can('read', 'ClassSession');
    can('read', 'Booking');
    can('read', 'Member');
    can('update', 'Member'); // assessments and notes
  } else if (user.role === 'DIETITIAN') {
    can('manage', 'DietProtocol');
    can('read', 'Member');
    can('update', 'Member'); // nutrition assignment
  } else if (user.role === 'FINANCE') {
    can('read', 'Invoice');
    can('manage', 'Invoice');
    can('read', 'Member');
  } else if (user.role === 'MEMBER') {
    can('read', 'ClassSession');
    can('create', 'Booking');
    can('read', 'Booking');
  }

  return build();
}
