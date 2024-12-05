import { z } from 'zod'

export class CargoInfo {
  description?: string | null
  weight?: number | null
  volume?: number | null
  plt?: number | null
  note?: string | null
  tRegime?: string | null

  constructor(p: unknown) {
    const parsed = CargoInfo.validationSchema.parse(p)
    this.description = parsed.description
    this.weight = parsed.weight
    this.volume = parsed.volume
    this.plt = parsed.plt
    this.note = parsed.note
    this.tRegime = parsed.tRegime
  }

  static get validationSchema() {
    return z.object({
      description: z.string().nullable().optional(),
      weight: z.number().nullable().optional(),
      volume: z.number().nullable().optional(),
      plt: z.number().nullable().optional(),
      note: z.string().nullable().optional(),
      tRegime: z.string().nullable().optional(),
    })
  }

  static get dbSchema() {
    return {
      description: String,
      weight: Number,
      volume: Number,
      plt: Number,
      tRegime: String,
      note: String,
    }
  }
}
