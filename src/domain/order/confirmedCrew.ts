import { Schema } from 'mongoose'
import { z } from 'zod'
import { objectIdSchema } from '@/shared/validationSchemes'
import { OrderVatRateInfo } from '../OrderVatRateInfo'

export class ConfirmedCrew {
  truck: string | null
  trailer?: string | null
  driver?: string | null
  outsourceAgreement?: string | null
  tkName?: string | null
  directiveAgreement: boolean
  // vatRateInfo?: OrderVatRateInfo

  constructor(props: unknown) {
    const p = ConfirmedCrew.validationSchema.parse(props)
    this.truck = p.truck?.toString() || null
    this.trailer = p.trailer?.toString() || null
    this.driver = p.driver?.toString() || null
    this.outsourceAgreement = p.outsourceAgreement?.toString() || null
    this.tkName = p.tkName?.toString() || null
    this.directiveAgreement = p.directiveAgreement
    // this.vatRateInfo = p.vatRateInfo || undefined
  }

  toJSON() {
    return {
      truck: this.truck || undefined,
      trailer: this.trailer || undefined,
      driver: this.driver || undefined,
      outsourceAgreement: this.outsourceAgreement || undefined,
      tkName: this.tkName || undefined,
      directiveAgreement: this.directiveAgreement,
      // vatRateInfo: this.vatRateInfo,
    }
  }

  static get validationSchema() {
    return z.object({
      truck: objectIdSchema.optional().nullable(),
      trailer: objectIdSchema.optional().nullable(),
      driver: objectIdSchema.optional().nullable(),
      outsourceAgreement: objectIdSchema.optional().nullable(),
      tkName: objectIdSchema.optional().nullable(),
      directiveAgreement: z
        .boolean()
        .optional()
        .default(false)
        .transform((v) => Boolean(v)),
      // vatRateInfo: OrderVatRateInfo.validationSchema.optional().nullable(),
    })
  }

  static dbSchema() {
    return {
      truck: {
        type: Schema.Types.ObjectId,
        ref: 'Truck',
      },
      trailer: {
        type: Schema.Types.ObjectId,
        ref: 'Truck',
      },
      driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver',
      },
      outsourceAgreement: {
        type: Schema.Types.ObjectId,
        ref: 'CarrierAgreement',
      },
      tkName: {
        type: Schema.Types.ObjectId,
        ref: 'TkName',
      },
      directiveAgreement: {
        type: Boolean,
        default: false,
      },
      vatRateInfo: OrderVatRateInfo.dbSchema,
    }
  }
}
