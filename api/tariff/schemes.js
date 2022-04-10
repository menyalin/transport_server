export const getListSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    limit: {
      type: 'string',
    },
    skip: {
      type: 'string',
    },
  },
  required: ['company', 'limit', 'skip'],
  additionalProperties: true,
}
