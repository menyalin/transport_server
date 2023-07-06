// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
import { queryValidator } from '../../utils/validator'

import { getAllowedTemplatesSchema } from './schemes'
import ctrl from '../../controllers/docTemplate.controller'

const router = express.Router()

// api/doc_templates
router.get(
  '/',
  [jwtAuth, queryValidator(getAllowedTemplatesSchema)],
  (...args) => ctrl.getAllowedTemplates(...args)
)

export default router
