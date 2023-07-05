// @ts-nocheck
import Ajv from 'ajv'

export const bodyValidator = (schema) => (req, res, next) => {
  const newAjv = new Ajv({ allErrors: true })
  const validate = newAjv.compile(schema)

  if (validate(req.body)) return next()

  res.status(400).json({ message: 'validation fail', errors: validate.errors })
}

export const queryValidator = (schema) => (req, res, next) => {
  const newAjv = new Ajv({ allErrors: true })
  const validate = newAjv.compile(schema)

  if (validate(req.query)) return next()

  res.status(400).json({ message: 'validation fail', errors: validate.errors })
}
