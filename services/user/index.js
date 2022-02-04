import { ORDER_STATUSES } from '../../constants/orderStatuses.js'
import { ORDER_ANALYTIC_TYPES } from '../../constants/orderAnalyticTypes.js'
import { User, UserActivity } from '../../models/index.js'
import {
  AddressService,
  CompanyService,
  DriverService,
  PartnerService,
  TkNameService,
  TruckService,
  OrderTemplateService
} from '../index.js'

class UserService {
  async findById(id, fields = '-password') {
    const user = await User.findById(id, fields)
    return user
  }

  async getUserData(id, fields = '-password') {
    const user = await User.findById(id, fields)
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
      orderAnalyticTypes
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
