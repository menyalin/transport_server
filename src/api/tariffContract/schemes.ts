export const getListSchema = {
  type: 'object',
  properties: {
    limit: {
      type: 'string',
    },
    skip: {
      type: 'string',
    },
  },
  required: ['limit', 'skip'],
  additionalProperties: true,
}
