// @ts-nocheck
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

export const bodyValidator = (schema) => (req, res, next) => {
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (validate(req.body)) return next()

  res.status(400).json({ message: 'validation fail', errors: validate.errors })
}

export const queryValidator = (schema) => (req, res, next) => {
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (validate(req.query)) return next()

  res.status(400).json({ message: 'validation fail', errors: validate.errors })
}
