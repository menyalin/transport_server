import { ORDER_STATUSES, ORDER_ANALYTIC_TYPES } from '../../constants/order.js'
import { PARTNER_GROUPS } from '../../constants/partner.js'
import { ORDER_PRICE_TYPES } from '../../constants/priceTypes.js'
import { User } from '../../models/index.js'
import {
  AddressService,
  CompanyService,
  DriverService,
  PartnerService,
  TkNameService,
  TruckService,
  OrderTemplateService,
  PermissionService,
  DocumentService,
  ZoneService,
  RegionService,
  CityService,
  WorkerService,
  GlobalSettingsService,
} from '../index.js'
import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
} from '../../constants/accounting.js'
import { TARIFF_TYPES, TARIFF_ROUND_BY_HOURS } from '../../constants/tariff.js'
import { emitTo } from '../../socket/index.js'

import {
  LOAD_DIRECTION,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_TYPES,
} from '../../constants/truck.js'
import { BadRequestError } from '../../helpers/errors.js'

class UserService {
  async findById(id, fields = '-password') {
    const user = await User.findById(id, fields).lean()
    return user
  }

  async getUserData(id, fields = '-password') {
    const user = await User.findById(id, fields).lean()
    if (!user) throw new Error('user not found!')
    const profile = user.directoriesProfile
    const companyInvites = await WorkerService.getUserInvites(id)
    const companies = await CompanyService.getUserCompanies(id)
    const staffRoles = await PermissionService.getAllRoles()
    const settings = await GlobalSettingsService.get()

    if (!profile) {
      return {
        user,
        companies,
        companyInvites,
        staffRoles,
        fineCategories: settings?.fineCategories,
      }
    }

    const addresses = await AddressService.getByProfile(profile)
    const drivers = await DriverService.getByProfile(profile)
    const trucks = await TruckService.getByProfile(profile)
    const tkNames = await TkNameService.getByProfile(profile)
    const partners = await PartnerService.getByProfile(profile)
    const documents = await DocumentService.getByProfile(profile)
    const zones = await ZoneService.getByProfile(profile)
    const regions = await RegionService.getByProfile(profile)
    const cities = await CityService.getByProfile(profile)
    const orderTemplates = await OrderTemplateService.getByProfile(profile)
    const permissions = await PermissionService.getUserPermissions({
      userId: id,
      companyId: profile,
    })
    const allTruckParams = {
      truckTypes: TRUCK_TYPES,
      truckKinds: TRUCK_KINDS,
      loadDirection: LOAD_DIRECTION,
      liftCapacityTypes: TRUCK_LIFT_CAPACITY_TYPES,
    }

    return {
      user,
      companies,
      addresses,
      drivers,
      trucks,
      tkNames,
      partners,
      staffRoles,
      permissions,
      allTruckParams,
      orderTemplates,
      documents,
      zones,
      regions,
      cities,
      companyInvites,
      fineCategories: settings?.fineCategories,
      partnerGroups: PARTNER_GROUPS,
      orderStatuses: ORDER_STATUSES,
      orderAnalyticTypes: ORDER_ANALYTIC_TYPES,
      orderPriceTypes: ORDER_PRICE_TYPES,
      documentTypes: DOCUMENT_TYPES,
      documentStatuses: DOCUMENT_STATUSES,
      tariffTypes: TARIFF_TYPES,
      roundingWaitingByHours: TARIFF_ROUND_BY_HOURS,
    }
  }

  async find(query, fields = '-password') {
    const tmp = await User.find(query, fields)
    return tmp
  }

  async findByEmail(email) {
    const user = await User.findOne(
      { email, openForSearch: true },
      '-password',
    )
    return user
  }

  async configProfile(userId, { directoriesProfile }) {
    const user = await User.findById(userId)
    emitTo(userId, 'user:changeDirectoriesProfile')
    if (directoriesProfile !== undefined)
      user.directoriesProfile = directoriesProfile
    await user.save()
  }

  async changePassword({ userId, newPassword, oldPassword }) {
    if (!userId) throw new BadRequestError('Something went wrong')
    const user = await User.findById(userId)
    if (await user.isCorrectPassword(oldPassword)) {
      user.password = newPassword
      await user.save()
      return null
    } else throw new BadRequestError('Something went wrong')
  }
}

export default new UserService()
