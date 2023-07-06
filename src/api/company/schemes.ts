// @ts-nocheck
export const createCompanySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    fullName: { type: 'string' },
    inn: { type: 'string' },
    hasOwnDirectories: { type: 'boolean' },
  },
  required: ['name', 'fullName', 'inn'],
  additionalProperties: true,
}

export const existInnSchema = {
  type: 'object',
  properties: {
    inn: { type: 'string' },
  },
  required: ['inn'],
  additionalProperties: false,
}

export const updateCompanySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    fullName: { type: 'string' },
    inn: { type: 'string' },
    hasOwnDirectories: { type: 'boolean' },
  },
  additionalProperties: false,
}
