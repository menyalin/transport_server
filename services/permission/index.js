import { ForbiddenError } from '../../helpers/errors.js'
import { CompanyService } from '../index.js'
import USER_ROLES from './userRoles.js'

import {
  director,
  dispatcher,
  seniorDispatcher,
  checkman,
  accountant,
  mechanic,
  admin,
  outsourceCarriersManager,
  userAdmin,
} from './permissionList.js'

class PermissionService {
  constructor() {
    this.defaultRoles = {
      admin,
      director,
      dispatcher,
      seniorDispatcher,
      checkman,
      accountant,
      mechanic,
      outsourceCarriersManager,
      userAdmin,
    }
  }

  _getPermissionsByRoles(roles) {
    const resMap = new Map()
    roles.forEach((role) => {
      const entries = Object.entries(this.defaultRoles[role] || {})

      entries.forEach((e) => {
        if (resMap.has(e[0]) && e[1] !== -1) {
          const existedVal = resMap.get(e[0])
          if (existedVal < e[1]) resMap.set(e[0], e[1])
        } else resMap.set(e[0], e[1])
      })
    })
    return resMap
  }

  async getUserPermissions({ userId, companyId }) {
    const employee = await CompanyService.getUserRolesByCompanyIdAndUserId({
      userId,
      companyId: companyId.toString() || companyId,
    })

    if (!employee) throw new ForbiddenError('Пользователь не найден')
    const permissionsMap = this._getPermissionsByRoles(employee.roles)
    return Object.fromEntries(permissionsMap)
  }

  async check({ userId, companyId, operation }) {
    if (!userId) throw new ForbiddenError('Не указан id пользователя')
    if (!companyId) throw new ForbiddenError('Не указан профиль настроек')
    const employee = await CompanyService.getUserRolesByCompanyIdAndUserId({
      userId,
      companyId,
    })
    if (!employee) throw new ForbiddenError('Пользователь не найден')
    if (Array.isArray(employee.roles) && employee.roles.includes('admin'))
      return true
    const userPermissionsMap = this._getPermissionsByRoles([...employee.roles])
    if (userPermissionsMap.has(operation) && userPermissionsMap.get(operation))
      return true

    throw new ForbiddenError('Действие запрещено')
  }

  async checkPeriod({ userId, companyId, operation, startDate }) {
    // найти разрешения для пользователя
    const permissions = await this.getUserPermissions({ userId, companyId })
    if (permissions.fullAccess || permissions[operation] === -1) return true

    if (!permissions || !permissions[operation])
      throw new ForbiddenError('Нет доступа!')
    const dayCount = Math.floor(
      (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24),
    )
    if (dayCount > permissions[operation])
      throw new ForbiddenError('Период закрыт')
    return true
  }

  async getAllRoles() {
    return USER_ROLES
  }
}

export default new PermissionService()
