// @ts-nocheck
export const getProfileListSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
  },
  required: ['profile'],
  additionalProperties: false,
}
