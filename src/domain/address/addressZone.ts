import { Schema, Types } from 'mongoose'
import { z } from 'zod'

export class AddressZone {
  _id: string
  name: string
  priority: number = 1
  isActive: boolean = true

  static readonly validationSchema = z.object({
    _id: z.instanceof(Types.ObjectId).optional(),
    name: z.string().min(1).max(100),
    priority: z.number().default(1),
    isActive: z.boolean().default(true),
  })

  constructor(props: any) {
    AddressZone.validationSchema.parse(props)
    this._id = props._id?.toString() ?? new Types.ObjectId().toString()
    this.name = props.name
    this.priority = props.priority
    this.isActive = props.isActive
  }
  static get dbSchema() {
    return new Schema(
      {
        name: String,
        priority: { type: Number, default: 1 },
        company: { type: Types.ObjectId, ref: 'Company' },
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true }
    )
  }
}
