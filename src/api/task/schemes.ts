// @ts-nocheck
export const taskConfirmSchema = {
  type: 'object',
  properties: {
    result: {
      enum: ['accepted', 'denied'],
    },
  },
  required: ['result'],
  additionalProperties: false,
}

//
