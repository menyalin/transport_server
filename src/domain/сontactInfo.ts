import { z } from 'zod'

export class ContactInfo {
  name?: string
  position?: string
  phone?: string
  email?: string
  note?: string

  constructor(props: unknown) {
    try {
      const p = ContactInfo.validationSchema.parse(props)
      this.name = p.name ?? undefined
      this.position = p.position ?? undefined
      this.phone = p.phone ?? undefined
      this.email = p.email ?? undefined
      this.note = p.note ?? undefined
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  static get validationSchema() {
    return z.object({
      name: z.string().optional().nullable(),
      position: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
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
