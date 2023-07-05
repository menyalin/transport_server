/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator } from '../../utils/validator.js'

import { getAllowedTemplatesSchema } from './schemes.js'
import ctrl from '../../controllers/docTemplate.controller.js'

const router = express.Router()

// api/doc_templates
router.get(
  '/',
  [jwtAuth, queryValidator(getAllowedTemplatesSchema)],
  (...args) => ctrl.getAllowedTemplates(...args)
)

export default router
