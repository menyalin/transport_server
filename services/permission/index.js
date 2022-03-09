import { ForbiddenError } from '../../helpers/errors.js'
import { CompanyService } from '../index.js'

class PermissionService {
  constructor() {
    this.list = {
      'address:readList': false,
      'address:readItem': false,
      'address:write': false,
      'address:delete': false
    }
    this.defaultRoles = {
      seniorDispatcher: {
        'address:readList': true,
        'address:readItem': true,
        'address:write': true,
        'address:delete': true
      },
      dispatcher: {
        'address:readList': true,
        'address:readItem': true,
        'address:write': true
      }
    }
  }

  _getPermissionsByRoles(roles) {
    const resMap = new Map()
    roles.forEach((role) => {
      const entries = Object.entries(this.defaultRoles[role])
      entries.forEach((e) => {
        resMap.set(e[0], e[1])
      })
    })
    return resMap
  }

  async check({ userId, companyId, operation }) {
    if (!companyId) throw new ForbiddenError('Не указан профиль настроек')
    const user = await CompanyService.getUserRolesByCompanyIdAndUserId({
      userId,
      companyId
    })
    if (!user) throw new ForbiddenError('Пользователь не найден')
    if (user.roles.includes('admin')) return true

    const userPermissionsMap = this._getPermissionsByRoles(user.roles)
    if (userPermissionsMap.has(operation) && userPermissionsMap.get(operation))
      return true

    throw new ForbiddenError('Действие запрещено')
  }

  async getAllRoles() {
    return [
      {
        value: 'admin',
        text: 'Администратор',
        note: 'Полный доступ к данным компании'
      },
      {
        value: 'seniorDispatcher',
        text: 'Старший логист',
        note: 'Описание...'
      },
      {
        value: 'dispatcher',
        text: 'Логист',
        note: 'Создание рейсов, адресов...'
      },
      { value: 'mechanic', text: 'Механик', note: 'Описание...' },
      {
        value: 'accountant',
        text: 'Бухгалтер'
      }
    ]
  }
}

export default new PermissionService()
