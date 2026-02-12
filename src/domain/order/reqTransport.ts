import { z } from 'zod'
import {
  LOAD_DIRECTION_ENUM,
  LOAD_DIRECTION_ENUM_VALUES,
  TRUCK_KINDS,
  TRUCK_KINDS_ENUM,
  TRUCK_KINDS_ENUM_VALUES,
  TRUCK_LIFT_CAPACITY_TYPES,
} from '@/constants/truck'
import {
  LiftCapacityEnumSchema,
  LoadDirectonEnumSchema,
  TruckKindsEnumSchema,
} from '@/shared/validationSchemes'

interface Props {
  kind: string
  liftCapacity: number
  loadDirection: string
}

export class OrderReqTransport {
  kind: TRUCK_KINDS_ENUM
  liftCapacity: number
  loadDirection: LOAD_DIRECTION_ENUM
  tailLift: boolean = false

  constructor(p: Props) {
    const parsedData = OrderReqTransport.validationSchema.parse(p)
    this.kind = parsedData.kind
    this.liftCapacity = parsedData.liftCapacity
    this.loadDirection = parsedData.loadDirection
    this.tailLift = parsedData.tailLift
  }

  get truckTypeDescription(): string {
    const kind = TRUCK_KINDS.find((i) => i.value === this.kind)
    return `${this.liftCapacity ? this.liftCapacity + 'т' : ''} ${kind?.text || ''}${this.tailLift ? ' Гидроборт' : ''}`
  }

  static get validationSchema() {
    return z.object({
      kind: TruckKindsEnumSchema,
      liftCapacity: LiftCapacityEnumSchema,
      loadDirection: LoadDirectonEnumSchema,
      tailLift: z
        .boolean()
        .optional()
        .nullable()
        .transform((v) => Boolean(v)),
    })
  }
  static get dbSchema() {
    return {
      kind: { type: String, enum: TRUCK_KINDS_ENUM_VALUES },
      liftCapacity: { type: Number, enum: TRUCK_LIFT_CAPACITY_TYPES },
      loadDirection: { type: String, enum: LOAD_DIRECTION_ENUM_VALUES },
      tailLift: { type: Boolean, default: false },
    }
  }
}
