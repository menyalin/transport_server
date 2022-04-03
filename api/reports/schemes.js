export const daysControlSchema = {
  type: 'object',
  properties: {
    profile: {
      type: 'string',
    },
    daysLimit: {
      type: 'string',
    },
  },
  required: ['profile'],
  additionalProperties: true,
}

export const driversGradesSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    dateRange: {
      type: 'array',
    },
  },
  required: ['company', 'dateRange'],
  additionalProperties: true,
}
