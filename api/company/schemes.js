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

export const userByEmailSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
  },
  required: ['email'],
  additionalProperties: false,
}

export const newEmployeeSchema = {
  type: 'object',
  properties: {
    user: { type: 'string' },
    position: { type: 'string' },
    roles: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['user', 'position', 'roles'],
  additionalProperties: true,
}
