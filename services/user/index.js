import { ORDER_STATUSES } from '../../constants/orderStatuses.js'
import { ORDER_ANALYTIC_TYPES } from '../../constants/orderAnalyticTypes.js'
import { ORDER_PRICE_TYPES } from '../../constants/priceTypes.js'
import { User, UserActivity } from '../../models/index.js'
import {
  AddressService,
  CompanyService,
  DriverService,
  PartnerService,
  TkNameService,
  TruckService,
  OrderTemplateService,
  PermissionService
} from '../index.js'
import { CALC_METHODS } from '../../constants/calcMethods.js'
import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES
} from '../../constants/accounting.js'

class UserService {
  async findById(id, fields = '-password') {
    const user = await User.findById(id, fields)
    return user
  }

  async getUserData(id, fields = '-password') {
    const user = await User.findById(id, fields).lean()
    if (!user) throw new Error('user not found!')

    UserActivity.create({ user: id, type: 'getUserData' })
    const profile = user.directoriesProfile
    const companies = await CompanyService.getUserCompanies(id)
    if (!profile) {
      return { user, companies }
    }

    const addresses = await AddressService.getByProfile(profile)
    const drivers = await DriverService.getByProfile(profile)
    const trucks = await TruckService.getByProfile(profile)
    const tkNames = await TkNameService.getByProfile(profile)
    const partners = await PartnerService.getByProfile(profile)
    const orderTemplates = await OrderTemplateService.getByProfile(profile)
    const orderStatuses = ORDER_STATUSES
    const orderAnalyticTypes = ORDER_ANALYTIC_TYPES
    const calcMethods = CALC_METHODS
    const orderPriceTypes = ORDER_PRICE_TYPES
    const documentTypes = DOCUMENT_TYPES
    const documentStatuses = DOCUMENT_STATUSES
    const staffRoles = await PermissionService.getAllRoles()
    const permissions = await PermissionService.getUserPermissions({
      userId: id,
      companyId: profile
    })

    return {
      user,
      companies,
      addresses,
      drivers,
      trucks,
      tkNames,
      partners,
      orderStatuses,
      orderTemplates,
      orderAnalyticTypes,
      calcMethods,
      orderPriceTypes,
      documentTypes,
      documentStatuses,
      staffRoles,
      permissions
    }
  }

  async find(query, fields = '-password') {
    const tmp = await User.find(query, fields)
    return tmp
  }

  async findByEmail(email) {
    const user = await User.findOne(
      { email, openForSearch: true },
      '-password'
    )
    return user
  }

  async configProfile(userId, { directoriesProfile }) {
    const user = await User.findById(userId)
    if (directoriesProfile !== undefined)
      user.directoriesProfile = directoriesProfile
    await user.save()
  }
}

export default new UserService()
