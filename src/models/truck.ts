import { Vehicle } from '@/domain/vehicle/vehicle'
import { model, Schema } from 'mongoose'

const truckSchema = new Schema(Vehicle.dbSchema, { timestamps: true })

export const Truck = model('Truck', truckSchema, 'trucks')
