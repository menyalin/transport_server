import { objectIdSchema } from '@/shared/validationSchemes'
import { z } from 'zod'

export class ReportItemDTO {
  orderId: string
  orderDate: Date
  clientName: string
  executorName?: string
  driverName: string
  truckNum: string
  trailerNum?: string | null
  orderType: string
  shippingAddress: string
  deliveryAddress: string
  consigneeType: string
  baseTariffType: string
  base: number
  payment: number
  waiting: number
  returnSum: number
  additionalPointsSum: number
  duration: number
  totalSum: number
  grade: number
  gradeNote?: string | null

  constructor(props: any) {
    const p = ReportItemDTO.validationSchema.parse(props)
    this.orderId = p._id.toString()
    this.orderDate = p.orderDate
    this.clientName = p._clientName
    this.driverName = p._driverFullName
    this.executorName = p._executorName
    this.truckNum = p._truckRegNum
    this.trailerNum = p._trailerRegNum
    this.orderType = p.orderTypeStr
    this.shippingAddress = p._loadingAddressesStr
    this.deliveryAddress = p._unloadingAddressesStr
    this.consigneeType = p._consigneeType.text
    this.baseTariffType = p._baseTariffTypeStr
    this.base = p.base
    this.payment = p.payment
    this.waiting = p.waiting
    this.returnSum = p.returnSum
    this.additionalPointsSum = p.additionalPointsSum
    this.duration = p.duration
    this.grade = p.grade.grade
    this.gradeNote = p.grade.note
    this.totalSum = p.totalSum
  }
  get tableData() {
    return {
      _id: this.orderId,
      'Дата рейса': this.orderDate,
      Клиент: this.clientName,
      Водитель: this.driverName,
      Грузовик: this.truckNum,
      Прицеп: this.trailerNum,
      Погрузка: this.shippingAddress,
      Выгрузка: this.deliveryAddress,
      Тип: this.orderType,
      'Тип грузополучателя': this.consigneeType,
      'Тип базового тарифа': this.baseTariffType,
      База: this.base,
      Простой: this.waiting,
      Возврат: this.returnSum,
      'Доп.точки': this.additionalPointsSum,
      Доплата: this.payment,
      Итого: this.totalSum,
      Часы: this.duration,
      Оценка: this.grade,
      'Комментарий к оценке': this.gradeNote,
    }
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema,
      orderDate: z.date(),
      _clientName: z.string(),
      _executorName: z.string().optional(),
      _driverFullName: z.string(),
      _trailerRegNum: z.string().optional().nullable(),
      _truckRegNum: z.string(),
      orderTypeStr: z.string(),
      _loadingAddressesStr: z.string(),
      _unloadingAddressesStr: z.string(),
      _consigneeType: z.object({
        text: z.string(),
      }),
      _baseTariffTypeStr: z.string(),

      base: z.number(),
      payment: z.number(),
      waiting: z.number(),
      returnSum: z.number(),
      additionalPointsSum: z.number(),
      totalSum: z.number(),
      duration: z.number(),
      grade: z.object({
        grade: z.number(),
        note: z.string().nullable().optional(),
      }),
    })
  }
}
