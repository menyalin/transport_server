import {
  LOAD_DIRECTION_ENUM,
  LOAD_DIRECTION_ENUM_VALUES,
  TRUCK_KINDS_ENUM,
  TRUCK_KINDS_ENUM_VALUES,
  TRUCK_LIFT_CAPACITY_TYPES,
} from '@/constants/truck'
import {
  LiftCapacityEnumSchema,
  LoadDirectonEnumSchema,
  TruckKindsEnumSchema,
} from '@/shared/validationSchemes'
import { z } from 'zod'

interface Props {
  kind: string
  liftCapacity: number
  loadDirection: string
}

export class OrderReqTransport {
  kind: TRUCK_KINDS_ENUM
  liftCapacity: (typeof TRUCK_LIFT_CAPACITY_TYPES)[number]
  loadDirection: LOAD_DIRECTION_ENUM

  constructor(p: Props) {
    const parsedData = OrderReqTransport.validationSchema.parse(p)
    this.kind = parsedData.kind
    this.liftCapacity = parsedData.liftCapacity
    this.loadDirection = parsedData.loadDirection
  }

  static get validationSchema() {
    return z.object({
      kind: TruckKindsEnumSchema,
      liftCapacity: LiftCapacityEnumSchema,
      loadDirection: LoadDirectonEnumSchema,
    })
  }
  static get dbSchema() {
    return {
      kind: {
        type: String,
        enum: TRUCK_KINDS_ENUM_VALUES,
      },
      liftCapacity: {
        type: Number,
        enum: TRUCK_LIFT_CAPACITY_TYPES,
      },
      loadDirection: {
        type: String,
        enum: LOAD_DIRECTION_ENUM_VALUES,
      },
    }
  }
}
