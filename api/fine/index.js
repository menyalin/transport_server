import express from 'express'

import { jwtAuth } from '../../utils/auth.middleware.js'
import { queryValidator } from '../../utils/validator.js'

import { getListSchema } from './schemes.js'
import ctrl from '../../controllers/fine.controller.js'

const router = express.Router()

// api/fines
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)

router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))
router.get('/number/:number', [jwtAuth], (...args) => ctrl.getByNumber(...args))
router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
