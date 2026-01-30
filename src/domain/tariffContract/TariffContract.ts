import z from 'zod'
import { Types } from 'mongoose'

import {
  DirectDistanceZonesBaseTariff,
  IdleTimeTariff,
  ReturnPercentTariff,
  ZonesBaseTariff,
} from './types/tarriffs'
import { BusEvent } from 'ts-bus/types'
import { TariffContractUpdatedEvent } from './events'
import { ConflictResourceError } from '@/helpers/errors'
import { isEqualArraysOfObjects } from '@/utils/isEqualArraysOfObjects'
import { DateUtils } from '@/utils/dateUtils'

import {
  dateOrISOStringSchema,
  objectIdSchema,
} from '@/shared/validationSchemes'
import { AddressZone } from '../address'

export class TariffContract {
  _id?: string
  agreement: string
  agreements?: string[]
  name: string
  company: string
  startDate: Date
  endDate: Date | null
  isActive: boolean = true
  withVat: boolean
  zonesTariffs: ZonesBaseTariff[]
  directDistanceZonesTariffs: DirectDistanceZonesBaseTariff[]
  returnPercentTariffs: ReturnPercentTariff[]
  idleTimeTariffs: IdleTimeTariff[]
  note?: string | null
  events: BusEvent[] = []
  _version: number = 0
  createdAt?: Date

  constructor(data: unknown) {
    const parsedData = TariffContract.validationSchema.parse(data)
    this._id = parsedData._id?.toString()
    this.agreement = parsedData.agreement
    this.agreements = parsedData.agreements
    this.name = parsedData.name
    this.startDate = parsedData.startDate
    this.endDate = parsedData.endDate
    this.isActive = parsedData.isActive
    this.withVat = parsedData.withVat
    this.company = parsedData.company.toString()
    this.zonesTariffs = parsedData.zonesTariffs
    this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs
    this.returnPercentTariffs = parsedData.returnPercentTariffs
    this.idleTimeTariffs = parsedData.idleTimeTariffs
    this.note = parsedData.note
    this.createdAt = parsedData.createdAt
    this._version = parsedData._version
  }

  clearEvents() {
    this.events = []
  }

  delete() {
    this.isActive = false
    this.events.push(TariffContractUpdatedEvent(this))
  }

  update(body: any) {
    let updated = false
    if (this._version !== body._version)
      throw new ConflictResourceError(
        'Версия документа устарела! Обновление не возможно!'
      )

    const parsedData = TariffContract.validationSchema.parse({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
    })

    // Проверяем простые поля - быстрые проверки
    if (this.agreement !== parsedData.agreement) {
      this.agreement = parsedData.agreement
      updated = true
    }

    if (
      !isEqualArraysOfObjects(
        this.agreements || [],
        parsedData.agreements || []
      )
    ) {
      this.agreements = parsedData.agreements
      updated = true
    }

    if (this.name !== parsedData.name) {
      this.name = parsedData.name
      updated = true
    }
    if (!DateUtils.isEqualDates(this.startDate, parsedData.startDate)) {
      this.startDate = parsedData.startDate
      updated = true
    }
    if (!DateUtils.isEqualDates(this.endDate, parsedData.endDate)) {
      this.endDate = parsedData.endDate
      updated = true
    }

    if (this.withVat !== parsedData.withVat) {
      this.withVat = parsedData.withVat
      updated = true
    }
    if (this.note !== parsedData.note) {
      this.note = parsedData.note
      updated = true
    }

    // Если уже есть изменения, применяем все массивы без сравнения (оптимизация)
    if (updated) {
      this.zonesTariffs = parsedData.zonesTariffs
      this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs
      this.returnPercentTariffs = parsedData.returnPercentTariffs
      this.idleTimeTariffs = parsedData.idleTimeTariffs
    } else {
      // Сравниваем массивы только если простые поля не изменились
      if (!isEqualArraysOfObjects(this.zonesTariffs, parsedData.zonesTariffs)) {
        this.zonesTariffs = parsedData.zonesTariffs
        updated = true
      }

      if (
        !updated &&
        !isEqualArraysOfObjects(
          this.directDistanceZonesTariffs,
          parsedData.directDistanceZonesTariffs
        )
      ) {
        this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs
        updated = true
      }

      if (
        !updated &&
        !isEqualArraysOfObjects(
          this.returnPercentTariffs,
          parsedData.returnPercentTariffs
        )
      ) {
        this.returnPercentTariffs = parsedData.returnPercentTariffs
        updated = true
      }

      if (
        !updated &&
        !isEqualArraysOfObjects(
          this.idleTimeTariffs,
          parsedData.idleTimeTariffs
        )
      ) {
        this.idleTimeTariffs = parsedData.idleTimeTariffs
        updated = true
      }
    }

    if (updated) {
      this._version += 1
      this.events.push(TariffContractUpdatedEvent(this))
    }
  }

  getAllZones(): string[] {
    let zones: string[] = []
    this.zonesTariffs.forEach((i) => {
      zones = zones.concat(
        ...i.unloadingZones.filter((zone) => !zones.includes(zone))
      )
    })
    return zones
  }

  private getTariffsWithContractData<
    T extends { setContractData: (_data: any) => void },
  >(tariffs: T[]): T[] {
    const contractData = {
      withVat: this.withVat,
      contractName: this.name,
      contractDate: this.startDate,
    }

    return tariffs.map((tariff) => {
      const tariffCopy = Object.assign(
        Object.create(Object.getPrototypeOf(tariff)),
        tariff
      )
      tariffCopy.setContractData(contractData)
      return tariffCopy
    })
  }

  getSortedZoneTariffs(zones: AddressZone[]): ZonesBaseTariff[] {
    const result = this.getTariffsWithContractData(this.zonesTariffs)
    result.forEach((tariff) => tariff.setPriority(zones))
    return result
  }

  getDirectDistanceZonesTariffs(): DirectDistanceZonesBaseTariff[] {
    return this.getTariffsWithContractData(this.directDistanceZonesTariffs)
  }

  getIdleTimeTariffs(): IdleTimeTariff[] {
    return this.getTariffsWithContractData(this.idleTimeTariffs)
  }

  getReturnPercentTariffs(): ReturnPercentTariff[] {
    return this.getTariffsWithContractData(this.returnPercentTariffs)
  }

  static validationSchema = z.object({
    _id: objectIdSchema.optional(),
    agreement: objectIdSchema.transform((val) => val.toString()),
    agreements: z
      .array(objectIdSchema)
      .transform((arr) => arr?.map((i) => i.toString()) || [])
      .optional(),
    name: z.string(),
    startDate: z.date(),
    company: objectIdSchema.transform((val) => val.toString()),
    endDate: z.date().nullable(),
    isActive: z.boolean().default(true),

    withVat: z.boolean(),
    zonesTariffs: z
      .array(ZonesBaseTariff.validationSchema)
      .transform((arr) => arr.map((i) => new ZonesBaseTariff(i))),
    directDistanceZonesTariffs: z
      .array(DirectDistanceZonesBaseTariff.validationSchema)
      .transform((arr) => arr.map((i) => new DirectDistanceZonesBaseTariff(i))),

    returnPercentTariffs: z
      .array(ReturnPercentTariff.validationSchema)
      .transform((arr) => arr.map((i) => new ReturnPercentTariff(i))),

    idleTimeTariffs: z
      .array(IdleTimeTariff.validationSchema)
      .transform((arr) => arr.map((i) => new IdleTimeTariff(i))),
    note: z.string().optional().nullable(),
    events: z.array(z.unknown()).optional(),
    createdAt: dateOrISOStringSchema.optional(),
    _version: z.number().default(0),
  })

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company' },
      agreement: { type: Types.ObjectId, ref: 'Agreement' },
      agreements: [{ type: Types.ObjectId, ref: 'Agreement' }],
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
      withVat: Boolean,
      zonesTariffs: [ZonesBaseTariff.dbSchema],
      directDistanceZonesTariffs: [DirectDistanceZonesBaseTariff.dbSchema],
      returnPercentTariffs: [ReturnPercentTariff.dbSchema],
      idleTimeTariffs: [IdleTimeTariff.dbSchema],
      note: String,
      _version: { type: Number, default: 0 },
    }
  }
}
