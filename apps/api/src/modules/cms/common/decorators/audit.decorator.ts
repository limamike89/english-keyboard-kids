import { SetMetadata } from '@nestjs/common'

export const AUDIT_KEY = 'audit'
export const AUDIT_ENTITY_KEY = 'audit-entity'

export interface AuditOptions {
  entityType: string
  action: string
}

export const Audit = (entityType: string, action: string) =>
  SetMetadata(AUDIT_KEY, { entityType, action } as AuditOptions)
