exports.createCompanySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    fullName: { type: 'string' }
  },
  // required: ['email', 'password'],
  additionalProperties: true
}
