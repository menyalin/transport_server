export const createSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string'
    },
    startPositionDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    },
    endPositionDate: {
      type: ['string', 'null'],
      formats: ['date', 'date-time']
    }
  },
  required: ['company', 'startPositionDate', 'endPositionDate'],
  additionalProperties: true
}
