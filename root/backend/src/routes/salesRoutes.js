import { Router } from 'express'
import { getFilters, getSales } from '../controllers/salesController.js'

const router = Router()

router.get('/sales', getSales)
router.get('/filters', getFilters)

export default router
