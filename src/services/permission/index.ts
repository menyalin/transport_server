import { ForbiddenError } from '../../helpers/errors'
import { WorkerService, UserService } from '..'
import { Types } from 'mongoose'
import USER_ROLES from './userRoles'

import * as roles from './permissionList'

type PermissionValue = boolean | number
type RoleName = keyof typeof roles
type PermissionsMap = Record<string, PermissionValue>

class PermissionService {
  defaultRoles: typeof roles

  constructor() {
    this.defaultRoles = roles
  }

  _getPermissionsByRoles(roles: RoleName[]): Map<string, PermissionValue> {
    const resMap = new Map<string, PermissionValue>()
    roles.forEach((role) => {
      const entries = Object.entries(this.defaultRoles[role] || {})

      entries.forEach((e) => {
        const [key, value] = e
        if (resMap.has(key) && value !== -1) {
          const existedVal = resMap.get(key)
          if (
            typeof existedVal === 'number' &&
            typeof value === 'number' &&
            existedVal < value
          ) {
            resMap.set(key, value)
          }
        } else {
          resMap.set(key, value)
        }
      })
    })
    return resMap
  }

  async adminCheck(userId: string): Promise<void> {
    const user = await UserService.findById(userId)
    if (!user || !user.isAdmin) throw new ForbiddenError('only global admin!')
  }

  async isAdmin(userId: string): Promise<Boolean> {
    const user = await UserService.findById(userId)
    return user?.isAdmin ?? false
  }

  async getUserPermissions({
    userId,
    companyId,
  }: {
    userId: string
    companyId: string | Types.ObjectId
  }): Promise<PermissionsMap> {
    const roles = await WorkerService.getWorkerRolesByCompanyIdAndUserId({
      userId,
      companyId: companyId.toString() || companyId,
    })
    if (!roles) throw new ForbiddenError('У пользователя нет ролей в компании')
    const permissionsMap = this._getPermissionsByRoles(roles)
    return Object.fromEntries(permissionsMap)
  }

  async check({
    userId,
    companyId,
    operation,
  }: {
    userId: string
    companyId: string | Types.ObjectId
    operation: string
  }): Promise<boolean> {
    if (!userId) throw new ForbiddenError('Не указан id пользователя')
    if (!companyId) throw new ForbiddenError('Не указан профиль настроек')
    const roles = await WorkerService.getWorkerRolesByCompanyIdAndUserId({
      userId,
      companyId: companyId.toString() || companyId,
    })
    if (!roles) throw new ForbiddenError('У пользователя нет ролей')
    if (Array.isArray(roles) && roles.includes('admin')) return true
    const userPermissionsMap = this._getPermissionsByRoles(roles)
    if (userPermissionsMap.has(operation) && userPermissionsMap.get(operation))
      return true

    throw new ForbiddenError('Действие запрещено')
  }

  async checkPeriod({
    userId,
    companyId,
    operation,
    startDate,
  }: {
    userId: string
    companyId: string | Types.ObjectId
    operation: string
    startDate: Date | string
  }): Promise<boolean> {
    const permissions = await this.getUserPermissions({ userId, companyId })
    if (permissions.fullAccess || permissions[operation] === -1) return true

    if (!permissions || !permissions[operation])
      throw new ForbiddenError('Нет доступа!')
    const dayCount = Math.floor(
      (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (
      typeof permissions[operation] === 'number' &&
      dayCount > permissions[operation]
    )
      throw new ForbiddenError('Период закрыт')
    return true
  }

  async getAllRoles() {
    return USER_ROLES
  }
}

export default new PermissionService()
