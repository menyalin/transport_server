import { Schema, model, Types } from 'mongoose'

import {
  DOCUMENT_TYPES_ENUM,
  DOCUMENT_STATUSES_ENUM,
} from '@/constants/accounting'
import { ORDER_STATUSES_ENUM } from '../constants/order'
import { Client } from '@/domain/order/client'
import { ConfirmedCrew } from '@/domain/order/confirmedCrew'
import { OrderPrice } from '@/domain/order/orderPrice'
import { OrderPaymentPart } from '@/domain/order/paymentPart'
import { OrderAnalytics } from '@/domain/order/analytics'
import { OrderReqTransport } from '@/domain/order/reqTransport'
import { RoutePoint } from '@/domain/order/route/routePoint'
import { CargoInfo } from '@/domain/cargoInfo'

const outsourceCosts = [
  {
    type: {
      type: String,
      required: true,
    },
    priceWOVat: { type: Number },
    sumVat: { type: Number },
    price: { type: Number },
    note: String,
    cashPayment: Boolean,
  },
]

const docsState = {
  getted: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
  },
}

const paymentToDriver = {
  sum: Number,
  note: String,
  worker: {
    type: Types.ObjectId,
    ref: 'Worker',
  },
}

const docs = [
  {
    addToRegistry: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: DOCUMENT_TYPES_ENUM,
    },
    number: {
      type: String,
    },
    note: String,
    status: {
      type: String,
      enum: DOCUMENT_STATUSES_ENUM,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
]

const grade = {
  grade: Number,
  note: String,
}

const state = {
  status: {
    type: String,
    enum: ORDER_STATUSES_ENUM,
  },
  warning: {
    type: Boolean,
    default: false,
  },
  driverNotified: {
    type: Boolean,
    default: false,
  },
  clientNotified: {
    type: Boolean,
    default: false,
  },
}

const confirmedCrew = ConfirmedCrew.dbSchema()

const schema = new Schema(
  {
    startPositionDate: { type: Date, required: true },
    grade,
    docs,
    client: Client.dbSchema(),
    prePrices: [OrderPrice.dbSchema],
    prices: [OrderPrice.dbSchema],
    finalPrices: [OrderPrice.dbSchema],
    outsourceCosts,
    confirmedCrew,
    route: [RoutePoint.dbSchema],
    cargoParams: CargoInfo.dbSchema,
    reqTransport: OrderReqTransport.dbSchema,
    state,
    paymentParts: [OrderPaymentPart.dbSchema],
    analytics: OrderAnalytics.dbSchema,
    docsState,
    paymentToDriver,
    isActive: { type: Boolean, default: true },
    isDisabled: { type: Boolean, default: false },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    note: { type: String },
    noteAccountant: { type: String },
  },
  { timestamps: true }
)

export const OrderModel = model('Order', schema, 'orders')
