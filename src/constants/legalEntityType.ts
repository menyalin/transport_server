export enum LEGAL_ENTITY_TYPE_ENUM {
  legalEntity = 'legalEntity',
  privatePerson = 'privatePerson',
  soleProprietor = 'soleProprietor',
}

export const LEGAL_ENTITY_TYPES = {
  [LEGAL_ENTITY_TYPE_ENUM.legalEntity]: 'Юридическое лицо',
  [LEGAL_ENTITY_TYPE_ENUM.privatePerson]: 'Физическое лицо',
  [LEGAL_ENTITY_TYPE_ENUM.soleProprietor]: 'ИП',
}

export const LEGAL_ENTITY_TYPE_VALUES = Object.values(LEGAL_ENTITY_TYPE_ENUM)
