export const PERMISSIONS = {
  dashboardRead: 'dashboard:read',
  contactsRead: 'contacts:read',
  contactsWrite: 'contacts:write',
  leadsRead: 'leads:read',
  leadsWrite: 'leads:write',
  opportunitiesRead: 'opportunities:read',
  opportunitiesWrite: 'opportunities:write',
  pipelineAdmin: 'pipeline:admin',
  tasksManage: 'tasks:manage',
  userAdmin: 'user:admin',
  roleAdmin: 'role:admin',
  integrationAdmin: 'integration:admin',
  auditRead: 'audit:read',
  settingsAdmin: 'settings:admin',
  approvalsAct: 'approvals:act',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type Role = 'advisor' | 'manager' | 'admin'

const rolePermissions: Record<Role, Set<Permission>> = {
  advisor: new Set<Permission>([
    PERMISSIONS.dashboardRead,
    PERMISSIONS.contactsRead,
    PERMISSIONS.contactsWrite,
    PERMISSIONS.leadsRead,
    PERMISSIONS.leadsWrite,
    PERMISSIONS.opportunitiesRead,
    PERMISSIONS.opportunitiesWrite,
    PERMISSIONS.tasksManage,
    PERMISSIONS.approvalsAct,
  ]),
  manager: new Set<Permission>([
    PERMISSIONS.dashboardRead,
    PERMISSIONS.contactsRead,
    PERMISSIONS.contactsWrite,
    PERMISSIONS.leadsRead,
    PERMISSIONS.leadsWrite,
    PERMISSIONS.opportunitiesRead,
    PERMISSIONS.opportunitiesWrite,
    PERMISSIONS.pipelineAdmin,
    PERMISSIONS.tasksManage,
    PERMISSIONS.approvalsAct,
    PERMISSIONS.integrationAdmin,
    PERMISSIONS.auditRead,
    PERMISSIONS.settingsAdmin,
  ]),
  admin: new Set<Permission>([
    PERMISSIONS.dashboardRead,
    PERMISSIONS.contactsRead,
    PERMISSIONS.contactsWrite,
    PERMISSIONS.leadsRead,
    PERMISSIONS.leadsWrite,
    PERMISSIONS.opportunitiesRead,
    PERMISSIONS.opportunitiesWrite,
    PERMISSIONS.pipelineAdmin,
    PERMISSIONS.tasksManage,
    PERMISSIONS.userAdmin,
    PERMISSIONS.roleAdmin,
    PERMISSIONS.integrationAdmin,
    PERMISSIONS.auditRead,
    PERMISSIONS.settingsAdmin,
    PERMISSIONS.approvalsAct,
  ]),
}

export function normalizeRole(role: string): Role {
  if (role === 'admin' || role === 'manager' || role === 'advisor') return role
  return 'advisor'
}

export function hasPermission(role: string, permission: Permission) {
  return rolePermissions[normalizeRole(role)].has(permission)
}
