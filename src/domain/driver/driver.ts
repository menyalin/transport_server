import { z } from 'zod'
import { Types } from 'mongoose'
import { objectIdSchema } from '@/shared/validationSchemes'
import { AdditionalNotification } from '../additionalNotification'
import { MedBook } from './medbook'

export class Driver {
  name: string
  surname: string
  patronymic?: string | null
  company: string
  tkName: string
  additionalNotifications?: AdditionalNotification[] | null
  passportId?: string | null
  passportIssued?: string | null
  passportDate?: Date | null
  licenseId?: string | null
  licenseDate?: Date | null
  licenseCategory?: string | null
  driverCardId?: string | null
  driverCardPeriod?: Date | null
  hasScans: boolean
  medBook?: MedBook | null
  employmentDate?: Date | null
  dismissalDate?: Date | null
  recommender?: string | null
  birthday?: Date | null
  isBrigadier: boolean
  isMechanic: boolean
  phone?: string | null
  phone2?: string | null
  hideInFines: boolean
  isActive: boolean
  isCalcSalary: boolean
  inn?: string | null

  constructor(props: unknown) {
    const p = Driver.validationSchema.parse(props)
    this.name = p.name
    this.surname = p.surname
    this.patronymic = p.patronymic
    this.company = p.company.toString()
    this.tkName = p.tkName.toString()
    this.additionalNotifications = p.additionalNotifications?.map(
      (i) => new AdditionalNotification(i)
    )
    this.passportId = p.passportId
    this.passportIssued = p.passportIssued
    this.passportDate = p.passportDate
    this.licenseId = p.licenseId
    this.licenseDate = p.licenseDate
    this.licenseCategory = p.licenseCategory
    this.driverCardId = p.driverCardId
    this.driverCardPeriod = p.driverCardPeriod
    this.hasScans = p.hasScans
    // this.medBook = new MedBook(p.medBook)
    this.employmentDate = p.employmentDate
    this.dismissalDate = p.dismissalDate
    this.recommender = p.recommender
    this.birthday = p.birthday
    this.isBrigadier = p.isBrigadier
    this.isMechanic = p.isMechanic
    this.phone = p.phone
    this.phone2 = p.phone2
    this.hideInFines = p.hideInFines
    this.isActive = p.isActive
    this.isCalcSalary = p.isCalcSalary
    this.inn = p.inn
  }

  get fullName(): string {
    return `${this.surname} ${this.name} ${this.patronymic}`.trim()
  }

  get passportInfo(): string {
    return `${this.passportId}, Выдан: ${this.passportIssued} ${this.passportDate?.toLocaleDateString('ru-RU') ?? ''}`.trim()
  }

  static get validationSchema() {
    return z.object({
      name: z.string(),
      surname: z.string(),
      patronymic: z.string().optional().nullable(),
      company: objectIdSchema,
      tkName: objectIdSchema,
      additionalNotifications: z
        .array(AdditionalNotification.validationSchema.optional())
        .optional()
        .nullable(),
      passportId: z.string().optional().nullable(),
      passportIssued: z.string().optional().nullable(),
      passportDate: z.date().optional().nullable(),
      licenseId: z.string().optional().nullable(),
      licenseDate: z.date().optional().nullable(),
      licenseCategory: z.string().optional().nullable(),
      driverCardId: z.string().optional().nullable(),
      driverCardPeriod: z.date().optional().nullable(),
      hasScans: z
        .boolean()
        .nullable()
        .default(false)
        .transform((v) => Boolean(v)),
      //   medBook: MedBook.validationSchema.optional().nullable(),
      employmentDate: z.date().optional().nullable(),
      dismissalDate: z.date().optional().nullable(),
      recommender: z.string().optional().nullable(),
      birthday: z.date().optional().nullable(),
      isBrigadier: z
        .boolean()
        .nullable()
        .default(false)
        .transform((v) => Boolean(v)),
      isMechanic: z
        .boolean()
        .nullable()
        .default(false)
        .transform((v) => Boolean(v)),
      phone: z.string().optional().nullable(),
      phone2: z.string().optional().nullable(),
      hideInFines: z
        .boolean()
        .nullable()
        .default(false)
        .transform((v) => Boolean(v)),
      isActive: z
        .boolean()
        .nullable()
        .default(true)
        .transform((v) => Boolean(v)),
      isCalcSalary: z
        .boolean()
        .nullable()
        .default(false)
        .transform((v) => Boolean(v)),
      inn: z.string().optional().nullable(),
    })
  }

  static get dbSchema() {
    return {
      name: { type: String, required: true },
      surname: { type: String, required: true },
      patronymic: String,
      company: { type: Types.ObjectId, ref: 'Company' },
      tkName: { type: Types.ObjectId, ref: 'TkName', required: true },
      additionalNotifications: [AdditionalNotification.dbSchema],
      passportId: String,
      passportIssued: String,
      passportDate: Date,
      licenseId: String,
      licenseDate: Date,
      licenseCategory: String,
      driverCardId: String,
      driverCardPeriod: Date,
      hasScans: { type: Boolean, default: false },
      medBook: MedBook.dbSchema,
      employmentDate: Date,
      dismissalDate: Date,
      recommender: String,
      birthday: Date,
      isBrigadier: { type: Boolean, default: false },
      isMechanic: { type: Boolean, default: false },
      phone: String,
      phone2: String,
      hideInFines: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      isCalcSalary: { type: Boolean, default: false },
      inn: { type: String },
    }
  }
}
