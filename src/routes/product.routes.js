import {Router} from 'express'
import {createProduct,getAllUser} from '../controllers/product.controllers.js'

const routers = Router();

routers.post('/',createProduct)

routers.get('/',getAllUser)


export default routers