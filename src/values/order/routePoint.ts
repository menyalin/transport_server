import dayjs from 'dayjs'
import mongoose from 'mongoose'
import { POINT_TYPES_ENUM, POINT_TYPE_VALUES } from '../../constants/enums'
import { ITemplateRoutePoint } from './templateRoutePoint'

function setDate(date: Date | string | null): Date | null {
  if (!date) return null
  if (typeof date === 'string') return new Date(date)
  return date
}

export class RoutePoint {
  type: POINT_TYPES_ENUM
  address: string
  plannedDate: Date | null = null
  plannedDateDoc: Date | null = null
  intervalEndDate: Date | null = null
  intervalEndDateDoc: Date | null = null
  arrivalDate: Date | null = null
  arrivalDateDoc: Date | null = null
  departureDate: Date | null = null
  departureDateDoc: Date | null = null
  isReturn: boolean = false
  isPltReturn: boolean = false
  isAutofilled: boolean = false
  useInterval: boolean = false
  note?: string

  // TODO: add point interface
  constructor(point: any) {
    if (!POINT_TYPE_VALUES.includes(point.type))
      throw new Error('RoutePoint : constructor error : invalid point type')
    if (!point.address)
      throw new Error('RoutePoint : constructor error : address is missing')
    this.type = point.type
    this.address = point.address
    this.plannedDate = setDate(point.plannedDate)

    this.intervalEndDate =
      point.useInterval && point.intervalEndDate
        ? new Date(point.intervalEndDate)
        : null
    this.intervalEndDateDoc =
      point.useInterval && point.intervalEndDateDoc
        ? new Date(point.intervalEndDateDoc)
        : null
    this.arrivalDate = point.arrivalDate ? new Date(point.arrivalDate) : null
    this.departureDate = point.departureDate
      ? new Date(point.departureDate)
      : null
    this.plannedDateDoc = point.plannedDateDoc
      ? new Date(point.plannedDateDoc)
      : null
    this.arrivalDateDoc = point.arrivalDateDoc
      ? new Date(point.arrivalDateDoc)
      : null
    this.departureDateDoc = point.departureDateDoc
      ? new Date(point.departureDateDoc)
      : null
    this.isReturn = point.isReturn || false
    this.isPltReturn = point.isPltReturn || false
    this.isAutofilled = point.isAutofilled || false
    this.useInterval = point.useInterval || false
    this.note = point.note
  }

  static createFromTemplatePoint(
    templatePoint: ITemplateRoutePoint,
    orderDate: Date,
    isFirstPoint: boolean
  ): RoutePoint {
    if (!orderDate) throw new Error('OrderDate is missing!')

    const plannedDate: Date | null =
      templatePoint.hasFixedTime || isFirstPoint
        ? new Date(
            dayjs(orderDate)
              .add(templatePoint.fixedTime as number, 'hours')
              .add(templatePoint.offsetDays || 0, 'days')
              .toISOString()
          )
        : null

    const intervalEndDate: Date | null = templatePoint.useInterval
      ? new Date(
          dayjs(orderDate)
            .add(
              (templatePoint.fixedTime as number) + templatePoint.hoursInterval,
              'hours'
            )
            .add(templatePoint.offsetDays || 0, 'days')
            .toISOString()
        )
      : null

    return new RoutePoint({
      type: templatePoint.type,
      address: templatePoint.address,
      plannedDate,
      intervalEndDate,
      plannedDateDoc: plannedDate,
      intervalEndDateDoc: intervalEndDate,
      useInterval: templatePoint.useInterval,
      note: templatePoint.note,
    })
  }

  get isLoadingPointType() {
    return this.type === 'loading'
  }

  get isReturnPoint() {
    return this.isReturn || this.isPltReturn
  }

  get getDurationInMinutes() {
    if (!this.departureDateDoc || !this.arrivalDateDoc) return 0
    const depDate = dayjs(this.departureDateDoc)
    const arrDate = dayjs(this.arrivalDateDoc)
    return depDate.diff(arrDate, 'minutes')
  }

  get datesFilled() {
    return (
      (this.departureDateDoc || this.departureDate) &&
      (this.arrivalDateDoc || this.arrivalDate)
    )
  }

  get firstDate() {
    return this.arrivalDateDoc || this.arrivalDate
  }

  get lastDate() {
    if (this.departureDateDoc || this.departureDate)
      return this.departureDateDoc || this.departureDate
    return this.firstDate
  }

  // TODO: add point interface
  autofillDates({ minDate, unloadingDurationInMinutes }: any) {
    if (
      !minDate ||
      isNaN(unloadingDurationInMinutes || !(minDate instanceof Date))
    )
      throw new Error(
        'RoutePoint : autofillDates error : required params is missing'
      )

    if (this.arrivalDate && this.departureDate)
      return new Date(dayjs(this.departureDate).toISOString())

    let tmpDate = dayjs(minDate)

    if (!this.arrivalDate) {
      this.arrivalDate = new Date(tmpDate.toISOString())
      this.arrivalDateDoc = this.arrivalDate
      this.isAutofilled = true
    }

    if (!this.departureDate) {
      tmpDate = dayjs(this.arrivalDate).add(
        unloadingDurationInMinutes || 15,
        'minutes'
      )
      this.departureDate = new Date(tmpDate.toISOString())
      this.departureDateDoc = this.departureDate
      this.isAutofilled = true
    }
    return this.departureDate
  }

  static getDbSchema() {
    return {
      type: {
        type: String,
        enum: POINT_TYPE_VALUES,
        required: true,
      },
      address: {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
        required: true,
      },
      plannedDate: Date,
      intervalEndDate: Date,
      intervalEndDateDoc: Date,
      arrivalDate: Date,
      departureDate: Date,
      plannedDateDoc: Date,
      arrivalDateDoc: Date,
      departureDateDoc: Date,
      useInterval: { type: Boolean, default: false },
      isReturn: { type: Boolean, default: false },
      isPltReturn: { type: Boolean, default: false },
      isAutofilled: { type: Boolean, default: false },
      note: String,
    }
  }
}
