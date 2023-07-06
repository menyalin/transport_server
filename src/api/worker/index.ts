// @ts-nocheck
/* eslint-disable no-unused-vars */
import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware'
// import { queryValidator, bodyValidator } from '../../utils/validator'

// import { getProfileListSchema, createSchema } from './schemes'
import ctrl from '../../controllers/worker.controller'

const router = express.Router()

// api/documents
router.get('/', [jwtAuth], (...args) => ctrl.getByProfile(...args))
router.get('/user_by_email', [jwtAuth], (...args) =>
  ctrl.getUserByEmail(...args)
)
router.get('/get_for_autocomplete', [jwtAuth], (...args) =>
  ctrl.getForAutocomplete(...args)
)
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id/addUser', [jwtAuth], (...args) => ctrl.addUser(...args))
router.put('/:workerId/acceptInvite', [jwtAuth], (...args) =>
  ctrl.acceptInvite(...args)
)
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
