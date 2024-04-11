import {Router} from 'express'
import user from './user.routes.js'
import product from './product.routes.js'
import {verifyToken} from '../utils/token.js'

const allRoutes = Router()

allRoutes.use('/user', user)
allRoutes.use('/product',verifyToken, product)

export default allRoutes