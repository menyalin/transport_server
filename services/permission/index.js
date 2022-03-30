import { ForbiddenError } from '../../helpers/errors.js'
import { CompanyService } from '../index.js'
import {
  director,
  dispatcher,
  seniorDispatcher,
  checkman,
  accountant,
  mechanic,
  admin,
  outsourceCarriersManager,
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
    }
  }

  _getPermissionsByRoles(roles) {
    const resMap = new Map()
    roles.forEach((role) => {
      const entries = Object.entries(this.defaultRoles[role] || {})
      if (entries) {
        entries.forEach((e) => {
          resMap.set(e[0], e[1])
        })
      }
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
    return [
      {
        value: 'admin',
        text: 'ТОП',
        note: 'Полный доступ к данным компании',
      },
      {
        value: 'director',
        text: 'Директор',
        note: 'Возможен просмотр всех данных, правка запрещена',
      },
      {
        value: 'seniorDispatcher',
        text: 'Руководитель логистики',
        note: 'Описание...',
      },
      {
        value: 'dispatcher',
        text: 'Логист',
        note: 'Создание рейсов, адресов...',
      },
      { value: 'juniorDispatcher', text: 'Диспетчер', note: 'Описание...' },
      { value: 'mechanic', text: 'Механик', note: 'Описание...' },
      { value: 'checkman', text: 'Учетчик', note: 'Описание...' },
      { value: 'brigadier', text: 'Бригадир', note: 'Описание...' },
      { value: 'trainee', text: 'Стажер', note: 'Описание...' },
      {
        value: 'accountant',
        text: 'Бухгалтер',
      },
      {
        value: 'outsourceCarriersManager',
        text: 'Менеджер по работе с привлеченными ТК',
      },
    ]
  }
}

export default new PermissionService()
