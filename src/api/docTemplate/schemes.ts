// @ts-nocheck
export const getAllowedTemplatesSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    client: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
  },
  required: ['company', 'client', 'type'],
  additionalProperties: true,
}
