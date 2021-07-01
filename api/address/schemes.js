export const getSuggestionsSchema = {
  type: 'object',
  properties: {
    address: {
      type: 'string'
    }
  },
  required: ['address'],
  additionalProperties: false
}

//
