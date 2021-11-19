export const createSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    startPositionDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    }
  },
  required: ['company', 'startPositionDate'],
  additionalProperties: true
}
