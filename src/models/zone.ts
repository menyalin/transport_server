import { AddressZone } from '@/domain/address'
import { model } from 'mongoose'

export default model('Zone', AddressZone.dbSchema, 'zones')
