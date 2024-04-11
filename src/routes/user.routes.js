import {Router} from 'express'
import {Register,login} from '../controllers/user.controller.js'



const routers = Router();

routers.post('/register',Register)
routers.post('/login',login)




export default routers