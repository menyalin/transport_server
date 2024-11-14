import {
  LEGAL_ENTITY_TYPE_ENUM,
  LEGAL_ENTITY_TYPE_VALUES,
} from '@/constants/legalEntityType'
import { z } from 'zod'

class Director {
  name: string
  isMainSignatory: boolean = true
  position?: string

  constructor(props: unknown) {
    const p = Director.validationSchema.parse(props)
    this.isMainSignatory = p.isMainSignatory
    this.name = p.name
    this.position = p.position
  }
  static get validationSchema() {
    return z.object({
      isMainSignatory: z
        .union([z.boolean(), z.string()])
        .transform((v) => Boolean(v)),
      name: z.string(),
      position: z.string().optional(),
    })
  }

  static get dbSchema() {
    return {
      name: { type: String, required: true },
      isMainSignatory: Boolean,
      position: String,
    }
  }
}

class Signatory {
  position: string
  fullName: string
  number?: string
  date?: Date | undefined

  constructor(props: unknown) {
    const p = Signatory.validationSchema.parse(props)
    this.position = p.position
    this.fullName = p.fullName
    this.number = p.number
    this.date = p.date ? new Date(p.date) : undefined
  }

  static get validationSchema() {
    return z.object({
      position: z.string(),
      fullName: z.string(),
      number: z.string().optional(),
      date: z.string().date().optional(),
    })
  }

  static get dbSchema() {
    return {
      position: { type: String, required: true },
      fullName: { type: String, required: true },
      number: String,
      date: Date,
    }
  }
}

export class CompanyInfo {
  legalForm?: LEGAL_ENTITY_TYPE_ENUM
  fullName?: string
  postalAddress?: string
  legalAddress?: string
  inn?: string
  ogrn?: string
  ogrnip?: string
  kpp?: string
  director?: Director
  signatory?: Signatory

  constructor(props: unknown) {
    const p = CompanyInfo.validationSchema.parse(props)
    this.legalForm = p.legalForm
    this.fullName = p.fullName
    this.postalAddress = p.postalAddress
    this.legalAddress = p.legalAddress
    this.inn = p.inn
    this.ogrn = p.ogrn
    this.ogrnip = p.ogrnip
    this.kpp = p.kpp
    this.director = p.director ? new Director(p.director) : undefined
    this.signatory = p.signatory ? new Signatory(p.signatory) : undefined
  }

  static get dbSchema() {
    return {
      legalForm: {
        type: String,
        enum: LEGAL_ENTITY_TYPE_VALUES,
      },
      fullName: String,
      postalAddress: String,
      legalAddress: String,
      inn: String,
      ogrn: String,
      ogrnip: String,
      kpp: String,
      director: Director.dbSchema,
      signatory: Signatory.dbSchema,
    }
  }

  static get validationSchema() {
    return z.object({
      legalForm: z.nativeEnum(LEGAL_ENTITY_TYPE_ENUM).optional(),
      fullName: z.string().optional(),
      postalAddress: z.string().optional(),
      legalAddress: z.string().optional(),
      inn: z.string().optional(),
      ogrn: z.string().optional(),
      ogrnip: z.string().optional(),
      kpp: z.string().optional(),
      director: Director.validationSchema.optional(),
      signatory: Signatory.validationSchema.optional(),
    })
  }
}
