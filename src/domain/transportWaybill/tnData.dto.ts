import { z } from 'zod'

export const TnPersonSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  inn: z
    .string()
    .regex(/^\d{10}$|^\d{12}$/, 'ИНН должен содержать 10 или 12 цифр'),
  address: z.string(),
})

export const TnShipperSchema = TnPersonSchema.extend({
  loadingAddress: z.string(),
  shortLoadingAddress: z.string(),
})

export const TnConsigneeSchema = TnPersonSchema.extend({
  unloadingAddress: z.string(),
  shortUnloadingAddress: z.string(),
})

export const TnCarrierSchema = TnPersonSchema

export const TnDriverSchema = z.object({
  name: z.string().min(1, 'Имя водителя обязательно'),
  surname: z.string().optional(),
})

export const TnVehicleSchema = z.object({
  model: z.string().min(1, 'Модель транспортного средства обязательна'),
  truckNum: z.string().min(1, 'Номер автомобиля обязателен'),
  trailerNum: z.string().optional(),
})

export const TnDataSchema = z.object({
  num: z.string().min(1, 'Номер накладной обязателен'),
  date: z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Дата должна быть в формате ДД.ММ.ГГГГ'),
  orderNum: z.string(),
  orderDate: z
    .string()
    .regex(
      /^\d{2}\.\d{2}\.\d{4}$/,
      'Дата заказа должна быть в формате ДД.ММ.ГГГГ'
    ),
  shipper: TnShipperSchema,
  consignee: TnConsigneeSchema,
  cargoDescription: z.string().min(1, 'Описание груза обязательно'),
  docsDescription: z.string(),
  carrier: TnCarrierSchema,
  driver: TnDriverSchema,
  vehicle: TnVehicleSchema,
})

export type TnDataDTO = z.infer<typeof TnDataSchema>
