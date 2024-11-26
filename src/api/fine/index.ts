// @ts-nocheck
import express from 'express'

import { jwtAuth } from '@/utils/auth.middleware'
import { queryValidator } from '@/utils/validator'

import { getListSchema } from './schemes'
import ctrl from '../../controllers/fine.controller'

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
