import { z } from 'zod'

export class ContactInfo {
  name: string
  position?: string
  phone?: string
  email?: string
  note?: string

  constructor(props: unknown) {
    const p = ContactInfo.validationSchema.parse(props)
    this.name = p.name
    this.position = p.position
    this.phone = p.phone
    this.email = p.email
    this.note = p.note
  }

  static get validationSchema() {
    return z.object({
      name: z.string(),
      position: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      note: z.string().optional(),
    })
  }

  static get dbSchema() {
    return {
      name: String,
      position: String,
      phone: String,
      email: String,
      note: String,
    }
  }
}
