// @ts-nocheck
import jwt from 'jsonwebtoken'
import { ORDER_STATUSES, ORDER_ANALYTIC_TYPES } from '../../constants/order'
import { PARTNER_GROUPS } from '../../constants/partner'
import { ORDER_PRICE_TYPES } from '../../constants/priceTypes'
import { DOCS_REGISTRY_STATUSES } from '../../constants/docsRegistry'
import { PAIMENT_INVOICE_STATUSES } from '../../constants/paymentInvoice'
import { User } from '../../models'

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
  NotificationService,
} from '..'
import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  SALARY_TARIFF_TYPES,
} from '../../constants/accounting'
import { TARIFF_TYPES, TARIFF_ROUND_BY_HOURS } from '../../constants/tariff'
import { emitTo } from '../../socket'

import {
  LOAD_DIRECTION,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_TYPES,
} from '../../constants/truck'
import { BadRequestError, NotFoundError } from '../../helpers/errors'

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

    const allTruckParams = {
      truckTypes: TRUCK_TYPES,
      truckKinds: TRUCK_KINDS,
      loadDirection: LOAD_DIRECTION,
      liftCapacityTypes: TRUCK_LIFT_CAPACITY_TYPES,
    }

    const settingsWithoutProfile = {
      user,
      companies,
      companyInvites,
      staffRoles,
      fineCategories: settings?.fineCategories,
      partnerGroups: PARTNER_GROUPS,
      orderStatuses: ORDER_STATUSES,
      orderAnalyticTypes: ORDER_ANALYTIC_TYPES,
      orderPriceTypes: ORDER_PRICE_TYPES,
      documentTypes: DOCUMENT_TYPES,
      documentStatuses: DOCUMENT_STATUSES,
      tariffTypes: TARIFF_TYPES,
      salaryTariffTypes: SALARY_TARIFF_TYPES,
      roundingWaitingByHours: TARIFF_ROUND_BY_HOURS,
      docsRegistryStatuses: DOCS_REGISTRY_STATUSES,
      paymentInvoiceStatuses: PAIMENT_INVOICE_STATUSES,
      allTruckParams: allTruckParams,
    }

    if (!profile) {
      return { ...settingsWithoutProfile }
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

    return {
      ...settingsWithoutProfile,
      addresses,
      drivers,
      trucks,
      tkNames,
      partners,
      permissions,
      orderTemplates,
      documents,
      zones,
      regions,
      cities,
    }
  }

  async find(query, fields = '-password') {
    const tmp = await User.find(query, fields)
    return tmp
  }

  async findByEmail(email) {
    const user = await User.findOne({ email, openForSearch: true }, '-password')
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

  async setPassword({ token, password }) {
    try {
      const { userId } = jwt.verify(token, process.env.ACCESS_JWT_SECRET)
      const user = await User.findOne({
        _id: userId,
        restorePasswordToken: token,
      })
      if (!user)
        throw new BadRequestError(
          'Активная ссылка для восстановления пароля не найдена'
        )
      user.password = password
      user.restorePasswordToken = null
      await user.save()
      return user
    } catch (e) {
      throw new BadRequestError(e.message)
    }
  }

  async sendRestoreLink(email) {
    if (!email) throw new BadRequestError('no email')
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new NotFoundError('user not found')
    user.restorePasswordToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '30m' }
    )
    await NotificationService.sendRestorePasswordLink({
      email,
      token: user.restorePasswordToken,
    })
    await user.save()
  }

  async sendConfirmationEmail(email) {
    if (!email) throw new BadRequestError('no email')
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new NotFoundError('user not found')
    if (user.emailConfirmed)
      throw new BadRequestError('email already confirmed')

    user.emailConfirmationToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '1d' }
    )
    await NotificationService.sendConfirmationEmailLink({
      email,
      token: user.emailConfirmationToken,
    })
    await user.save()
  }

  async confirmEmail({ token }) {
    try {
      const { userId } = jwt.verify(token, process.env.ACCESS_JWT_SECRET)
      const user = await User.findOne({
        _id: userId,
        emailConfirmationToken: token,
      })
      if (!user)
        throw new BadRequestError(
          'Активная ссылка подтверждения email не найдена'
        )
      user.emailConfirmed = true
      user.emailConfirmationToken = null
      await user.save()
    } catch (e) {
      throw new BadRequestError(e.message)
    }
  }
}

export default new UserService()
