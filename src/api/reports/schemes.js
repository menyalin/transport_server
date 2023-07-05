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
export const grossProfitSchema = {
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

export const grossProfitPivotSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
    dateRange: {
      type: 'array',
    },
    groupBy: { type: 'string' },
  },
  required: ['company', 'dateRange', 'groupBy'],
  additionalProperties: true,
}

export const grossProfitDetailsSchema = {
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

export const orderDocsSchema = {
  type: 'object',
  properties: {
    company: {
      type: 'string',
    },
  },
  required: ['company'],
  additionalProperties: true,
}
