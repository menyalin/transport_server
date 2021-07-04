export const loginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 4 }
  },
  required: ['email', 'password'],
  additionalProperties: false
}

export const registrationSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 4 },
    name: { type: 'string', minLength: 1 }
  },
  required: ['email', 'password', 'name'],
  additionalProperties: false
}

export const configProfileSchema = {
  type: 'object',
  properties: {
    directoriesProfile: { type: ['string', 'null'] }
  },
  additionalProperties: false
}
