import { ORDER_STATUSES } from '../../constants/orderStatuses.js'
import { User, UserActivity } from '../../models/index.js'
import {
  AddressService,
  CompanyService,
  DriverService,
  PartnerService,
  TkNameService,
  TruckService
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
    const addresses = await AddressService.getByProfile(profile)
    const drivers = await DriverService.getByProfile(profile)
    const trucks = await TruckService.getByProfile(profile)
    const tkNames = await TkNameService.getByProfile(profile)
    const partners = await PartnerService.getByProfile(profile)
    const orderStatuses = ORDER_STATUSES
    return {
      user,
      companies,
      addresses,
      drivers,
      trucks,
      tkNames,
      partners,
      orderStatuses
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
