import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { POINT_TYPES } from '../constants/enums.js'

export class RoutePoint {
  constructor(point) {
    if (!POINT_TYPES.includes(point.type))
      throw new Error('RoutePoint : constructor error : invalid point type')
    if (!point.address)
      throw new Error('RoutePoint : constructor error : address is missing')
    this.type = point.type
    this.address = point.address
    this.plannedDate = point.plannedDate ? new Date(point.plannedDate) : null
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
    this.note = point.note
  }

  get datesFilled() {
    return this.departureDate && this.arrivalDate
  }

  get firstDate() {
    return this.arrivalDate
  }

  get lastDate() {
    if (this.departureDate) return this.departureDate
    else if (this.arrivalDate) return this.arrivalDate
    else return null
  }

  autofillDates({ minDate, unloadingDurationInMinutes }) {
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

    if (!this.departureDates) {
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
        enum: POINT_TYPES,
      },
      address: {
        type: mongoose.Types.ObjectId,
        ref: 'Address',
      },
      plannedDate: Date,
      arrivalDate: Date,
      departureDate: Date,
      plannedDateDoc: Date,
      arrivalDateDoc: Date,
      departureDateDoc: Date,
      isReturn: { type: Boolean, default: false },
      isPltReturn: { type: Boolean, default: false },
      isAutofilled: { type: Boolean, default: false },
      note: String,
    }
  }
}
