import { z } from 'zod'

export class AdditionalVehicleInfo {
  diagnosticCardExpDate?: Date | null
  diagnosticCardNote?: string | null
  platonNumber?: string | null
  platonDate?: Date | null
  tachographNumber?: string | null
  tachographExpDate?: Date | null
  tachographNote?: string | null
  transponderNumber?: string | null
  transponderDate?: Date | null
  fuelCardNumber?: string | null
  fuelCardDate?: Date | null
  fuelCardNote?: string | null

  constructor(props: unknown) {
    const p = AdditionalVehicleInfo.validationSchema.parse(props)
    this.diagnosticCardExpDate = p.diagnosticCardExpDate
    this.diagnosticCardNote = p.diagnosticCardNote
    this.platonNumber = p.platonNumber
    this.platonDate = p.platonDate
    this.tachographNumber = p.tachographNumber
    this.tachographExpDate = p.tachographExpDate
    this.tachographNote = p.tachographNote
    this.transponderNumber = p.transponderNumber
    this.transponderDate = p.transponderDate
    this.fuelCardNumber = p.fuelCardNumber
    this.fuelCardDate = p.fuelCardDate
    this.fuelCardNote = p.fuelCardNote
  }
  static get validationSchema() {
    return z.object({
      diagnosticCardExpDate: z.date().optional().nullable(),
      diagnosticCardNote: z.string().optional().nullable(),
      platonNumber: z.string().optional().nullable(),
      platonDate: z.date().optional().nullable(),
      tachographNumber: z.string().optional().nullable(),
      tachographExpDate: z.date().optional().nullable(),
      tachographNote: z.string().optional().nullable(),
      transponderNumber: z.string().optional().nullable(),
      transponderDate: z.date().optional().nullable(),
      fuelCardNumber: z.string().optional().nullable(),
      fuelCardDate: z.date().optional().nullable(),
      fuelCardNote: z.string().optional().nullable(),
    })
  }
  static get dbSchema() {
    return {
      diagnosticCardExpDate: Date,
      diagnosticCardNote: String,
      platonNumber: String,
      platonDate: Date,
      tachographNumber: String,
      tachographExpDate: Date,
      tachographNote: String,
      transponderNumber: String,
      transponderDate: Date,
      fuelCardNumber: String,
      fuelCardDate: Date,
      fuelCardNote: String,
    }
  }
}
