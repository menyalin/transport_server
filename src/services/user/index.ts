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
  CarrierService,
  TruckService,
  OrderTemplateService,
  PermissionService,
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
} from '@/constants/accounting'
import {
  TARIFF_TYPES,
  TARIFF_ROUND_BY_HOURS,
  IDLE_TIME_ROUNDING_INTERVALS,
} from '@/constants/tariff'
import { emitTo } from '@/socket'

import {
  LOAD_DIRECTION,
  TRUCK_KINDS,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_TYPES,
} from '../../constants/truck'
import { BadRequestError, NotFoundError } from '../../helpers/errors'
import { Types } from 'mongoose'

class UserService {
  ACCESS_JWT_SECRET: string
  constructor() {
    this.ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'default-secret'
  }
  async findById(id: string, fields = '-password') {
    const user = await User.findById(id, fields).lean()
    return user
  }

  async getUserData(id: string, fields = '-password') {
    const user = await User.findById(id, fields).lean()
    if (!user) throw new Error('user not found!')
    const profile = user.directoriesProfile?.toString()

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
      idleTimeRoundingIntervals: IDLE_TIME_ROUNDING_INTERVALS,
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
    const carriers = await CarrierService.getByProfile(profile)
    const partners = await PartnerService.getByProfile(profile)
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
      tkNames: carriers,
      partners,
      permissions,
      orderTemplates,
      zones,
      regions,
      cities,
    }
  }

  async find(query: any, fields = '-password') {
    const tmp = await User.find(query, fields)
    return tmp
  }

  async findByEmail(email: string) {
    const user = await User.findOne({ email, openForSearch: true }, '-password')
    return user
  }

  async configProfile(
    userId: string,
    { directoriesProfile }: { directoriesProfile: string }
  ) {
    const user = await User.findById(userId)
    emitTo(userId, 'user:changeDirectoriesProfile', directoriesProfile)

    if (!user) throw new NotFoundError('user not found')
    if (
      directoriesProfile !== undefined &&
      Types.ObjectId.isValid(directoriesProfile)
    ) {
      user.directoriesProfile = Types.ObjectId.createFromHexString(
        directoriesProfile
      ) as any
      await user.save()
    }
  }

  async changePassword({
    userId,
    newPassword,
    oldPassword,
  }: {
    userId: string
    newPassword: string
    oldPassword: string
  }) {
    if (!userId) throw new BadRequestError('Something went wrong')
    const user = await User.findById(userId)
    if (user && (await (user as any).isCorrectPassword(oldPassword))) {
      user.password = newPassword
      await user.save()
      return null
    } else throw new BadRequestError('Something went wrong')
  }

  async setPassword({ token, password }: { token: string; password: string }) {
    const payload = jwt.verify(token, this.ACCESS_JWT_SECRET)
    if (typeof payload !== 'object' || !payload?.userId)
      throw new BadRequestError('set password error: invalid token payload')
    const user = await User.findOne({
      _id: payload.userId,
      restorePasswordToken: token,
    })
    if (!user)
      throw new BadRequestError(
        'Активная ссылка для восстановления пароля не найдена'
      )
    user.password = password
    user.restorePasswordToken = ''
    await user.save()
    return user
  }

  async sendRestoreLink(email: string) {
    if (!email) throw new BadRequestError('no email')
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new NotFoundError('user not found')
    user.restorePasswordToken = jwt.sign(
      { userId: user._id.toString() },
      this.ACCESS_JWT_SECRET,
      { expiresIn: '30m' }
    )
    await NotificationService.sendRestorePasswordLink({
      email,
      token: user.restorePasswordToken,
    })
    await user.save()
  }

  async sendConfirmationEmail(email: string) {
    if (!email) throw new BadRequestError('no email')
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new NotFoundError('user not found')
    if (user.emailConfirmed)
      throw new BadRequestError('email already confirmed')

    user.emailConfirmationToken = jwt.sign(
      { userId: user._id.toString() },
      this.ACCESS_JWT_SECRET,
      { expiresIn: '1d' }
    )
    await NotificationService.sendConfirmationEmailLink({
      email,
      token: user.emailConfirmationToken,
    })
    await user.save()
  }

  async confirmEmail({ token }: { token: string }) {
    const payload = jwt.verify(token, this.ACCESS_JWT_SECRET)

    if (typeof payload !== 'object' || !payload?.userId)
      throw new BadRequestError('Something went wrong')
    const user = await User.findOne({
      _id: payload?.userId,
      emailConfirmationToken: token,
    })
    if (!user)
      throw new BadRequestError(
        'Активная ссылка подтверждения email не найдена'
      )
    user.emailConfirmed = true
    user.emailConfirmationToken = ''
    await user.save()
  }
}

export default new UserService()
