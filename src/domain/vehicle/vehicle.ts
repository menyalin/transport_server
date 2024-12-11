import {
  TRUCK_TYPES_ENUM_VALUES,
  TRUCK_KINDS_ENUM_VALUES,
  TRUCK_LIFT_CAPACITY_TYPES,
  TRUCK_TYPES_ENUM,
  TRUCK_KINDS_ENUM,
} from '@/constants/truck'
import { AdditionalNotification } from '@/domain/additionalNotification'
import { Types } from 'mongoose'
import { AdditionalVehicleInfo } from './additionalVehichleInfo'
import { AllowedDriver } from './allowedDriver'
import { InsuranceInfo } from './insuranceInfo'
import { PermitsInfo } from './permitsInfo'
import { z } from 'zod'
import { objectIdSchema } from '@/shared/validationSchemes'

export class Vehicle {
  additionalNotifications: AdditionalNotification[]
  additionalDetails?: AdditionalVehicleInfo
  insurance?: InsuranceInfo
  permits?: PermitsInfo
  brand?: string | null
  model?: string | null
  brigadier?: string | null
  mechanic?: string | null
  sanitaryPassportExpDate?: Date | null
  sanitaryPassportNote?: string | null
  issueYear?: number | null
  startServiceDate?: Date | null
  endServiceDate?: Date | null
  type: TRUCK_TYPES_ENUM
  kind: TRUCK_KINDS_ENUM | null
  liftCapacityType: number
  order: number
  tkName: string
  regNum: string
  win?: string | null
  sts?: string | null
  stsDate?: Date | null
  pts?: string | null
  owner?: string | null
  volumeFuel?: number | null
  volumeRef?: number | null
  liftCapacity?: number | null
  pltCount?: number | null
  pltCapacity?: number | null
  pltVolume?: number | null
  company: string
  isActive: boolean
  allowedDrivers?: AllowedDriver[]

  constructor(props: unknown) {
    const p = Vehicle.validationSchema.parse(props)
    this.additionalNotifications = p.additionalNotifications
      ? p.additionalNotifications.map((i) => new AdditionalNotification(i))
      : []
    this.additionalDetails = p.additionalDetails
      ? new AdditionalVehicleInfo(p.additionalDetails)
      : undefined
    this.insurance = p.insurance
    this.permits = p.permits
    this.brand = p.brand
    this.model = p.model
    this.brigadier = p.brigadier
    this.mechanic = p.mechanic
    this.sanitaryPassportExpDate = p.sanitaryPassportExpDate
    this.sanitaryPassportNote = p.sanitaryPassportNote
    this.issueYear = p.issueYear
    this.startServiceDate = p.startServiceDate
    this.endServiceDate = p.endServiceDate
    this.type = p.type
    this.kind = p.kind
    this.liftCapacityType = p.liftCapacityType
    this.tkName = p.tkName.toString()
    this.regNum = p.regNum
    this.win = p.win
    this.sts = p.sts
    this.stsDate = p.stsDate
    this.pts = p.pts
    this.owner = p.owner
    this.order = p.order ?? 0
    this.volumeFuel = p.volumeFuel
    this.volumeRef = p.volumeRef
    this.liftCapacity = p.liftCapacity
    this.pltCount = p.pltCount
    this.company = p.company?.toString()
    this.isActive = p.isActive
    this.allowedDrivers = p.allowedDrivers
      ? p.allowedDrivers.map((i) => new AllowedDriver(i))
      : []
  }

  static get validationSchema() {
    return z.object(
      {
        additionalNotifications: z
          .array(AdditionalNotification.validationSchema)
          .optional()
          .nullable(),
        additionalDetails: AdditionalVehicleInfo.validationSchema.optional(),
        insurance: InsuranceInfo.validationSchema.optional(),
        permits: PermitsInfo.validationSchema.optional(),
        brand: z.string().optional().nullable(),
        model: z.string().optional().nullable(),
        brigadier: z.string().optional().nullable(),
        mechanic: z.string().optional().nullable(),
        sanitaryPassportExpDate: z.date().optional().nullable(),
        sanitaryPassportNote: z.string().optional().nullable(),
        issueYear: z.number().optional().nullable(),
        startServiceDate: z.date().optional().nullable(),
        endServiceDate: z.date().optional().nullable(),
        type: z.nativeEnum(TRUCK_TYPES_ENUM),
        kind: z.nativeEnum(TRUCK_KINDS_ENUM).nullable(),
        liftCapacityType: z.number(),
        tkName: objectIdSchema,
        regNum: z.string(),
        win: z.string().optional().nullable(),
        sts: z.string().optional().nullable(),
        stsDate: z.date().optional().nullable(),
        pts: z.string().optional().nullable(),
        owner: z.string().optional().nullable(),
        order: z.number().optional().nullable(),
        volumeFuel: z.number().optional().nullable(),
        volumeRef: z.number().optional().nullable(),
        liftCapacity: z.number().optional().nullable(),
        pltCount: z.number().optional().nullable(),
        company: objectIdSchema,
        hideInFines: z.boolean().optional().nullable(),
        isActive: z
          .boolean()
          .optional()
          .transform((v) => Boolean(v)),
        note: z.string().optional().nullable(),
        allowUseTrailer: z
          .boolean()
          .optional()
          .transform((v) => Boolean(v)),
        allowedDrivers: z
          .array(AllowedDriver.validationSchema)
          .optional()
          .nullable(),
      },
      { description: 'Vehicle validaton schema' }
    )
  }

  static get dbSchema() {
    return {
      additionalNotifications: [AdditionalNotification.dbSchema],
      additionalDetails: AdditionalVehicleInfo.dbSchema,
      insurance: InsuranceInfo.dbSchema,
      permits: PermitsInfo.dbSchema,
      brand: String,
      model: String,
      brigadier: { type: Types.ObjectId, ref: 'Driver' },
      mechanic: { type: Types.ObjectId, ref: 'Driver' },
      sanitaryPassportExpDate: Date,
      sanitaryPassportNote: String,
      issueYear: Number,
      startServiceDate: Date,
      endServiceDate: Date,
      type: { type: String, enum: TRUCK_TYPES_ENUM_VALUES },
      kind: { type: String, enum: [...TRUCK_KINDS_ENUM_VALUES, null] },
      liftCapacityType: { type: Number, enum: TRUCK_LIFT_CAPACITY_TYPES },
      tkName: { type: Types.ObjectId, ref: 'TkName' },
      regNum: { type: String, required: true },
      win: String,
      sts: String,
      stsDate: Date,
      pts: String,
      owner: String,
      order: { type: Number, default: 50 },
      volumeFuel: { type: Number, default: 0 },
      volumeRef: { type: Number, default: 0 },
      liftCapacity: { type: Number, default: 0 },
      pltCount: { type: Number, default: 0 },
      company: { type: Types.ObjectId, ref: 'Company' },
      hideInFines: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      note: String,
      allowUseTrailer: { type: Boolean, default: false },
      allowedDrivers: [AllowedDriver.dbSchema],
    }
  }
}
