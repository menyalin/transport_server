/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
// import { queryValidator, bodyValidator } from '../../utils/validator.js'

// import { getProfileListSchema, createSchema } from './schemes.js'
import ctrl from '../../controllers/worker.controller.js'

const router = express.Router()

// api/documents
router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
router.get('/user_by_email', [jwtAuth], (...args) =>
  ctrl.getUserByEmail(...args),
)
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id/addUser', [jwtAuth], (...args) => ctrl.addUser(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
