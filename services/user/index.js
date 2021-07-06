import { User } from '../../models/index.js'
import { AddressService, CompanyService, DriverService } from '../index.js'

class UserService {
  async findById(id, fields = '-password') {
    const user = await User.findById(id, fields)
    return user
  }

  async getUserData(id, fields = '-password') {
    const user = await User.findById(id, fields)
    const profile = user.directoriesProfile
    const companies = await CompanyService.getUserCompanies(id)
    const addresses = await AddressService.getByProfile(profile)
    const drivers = await DriverService.getByProfile(profile)
    return { user, companies, addresses, drivers }
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
