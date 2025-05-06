import {
  LEGAL_ENTITY_TYPE_ENUM,
  LEGAL_ENTITY_TYPE_VALUES,
} from '@/constants/legalEntityType'

import { z } from 'zod'

class Director {
  name?: string | null
  isMainSignatory: boolean = true
  position?: string | null

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
      name: z.string().nullable().optional(),
      position: z.string().nullable().optional(),
    })
  }

  static get dbSchema() {
    return {
      name: { type: String },
      isMainSignatory: Boolean,
      position: String,
    }
  }
}

class Signatory {
  position?: string | null
  fullName?: string | null
  number?: string | null
  date?: Date | null

  constructor(props: unknown) {
    const p = Signatory.validationSchema.parse(props)
    this.position = p.position
    this.fullName = p.fullName
    this.number = p.number
    this.date = p.date ? new Date(p.date) : undefined
  }

  static get validationSchema() {
    return z.object({
      position: z.string().nullable().optional(),
      fullName: z.string().nullable().optional(),
      number: z.string().nullable().optional(),
      date: z.string().date().nullable().optional(),
    })
  }

  static get dbSchema() {
    return {
      position: { type: String },
      fullName: { type: String },
      number: String,
      date: Date,
    }
  }
}

export class CompanyInfo {
  legalForm?: LEGAL_ENTITY_TYPE_ENUM | null
  fullName?: string | null
  postalAddress?: string | null
  legalAddress?: string | null
  inn?: string | null
  ogrn?: string | null
  ogrnip?: string | null
  kpp?: string | null
  director?: Director
  accountant?: Director
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
    this.accountant = p.accountant ? new Director(p.accountant) : undefined
  }

  getFullDataString(): string {
    return `${this.fullName ?? ''}, ИНН ${this.inn ?? ''}, ${this.legalAddress ?? ''}`
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
      accountant: Director.dbSchema,
      signatory: Signatory.dbSchema,
    }
  }

  static get validationSchema() {
    return z.object({
      legalForm: z.nativeEnum(LEGAL_ENTITY_TYPE_ENUM).nullable().optional(),
      fullName: z.string().nullable().optional(),
      postalAddress: z.string().nullable().optional(),
      legalAddress: z.string().nullable().optional(),
      inn: z.string().nullable().optional(),
      ogrn: z.string().nullable().optional(),
      ogrnip: z.string().nullable().optional(),
      kpp: z.string().nullable().optional(),
      director: Director.validationSchema.optional(),
      signatory: Signatory.validationSchema.optional(),
      accountant: Director.validationSchema.optional(),
    })
  }
}
