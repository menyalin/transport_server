export const daysControlSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string'
    },
    daysLimit: {
      type: 'string'
    }
  },
  required: ['profile'],
  additionalProperties: true
}
