import express from 'express'
const OrderRouter = express.Router()
import { GetUserOrders,CreateOrder } from '../Controllers/OrderController.js'
import { verifyToken } from '../Middleware/AuthMiddleware.js'
import { validateOrderCreate } from '../Middleware/ValidationMiddleware.js'

OrderRouter.post('/newOrder', verifyToken, validateOrderCreate, CreateOrder);
OrderRouter.get('/my-orders', verifyToken, GetUserOrders);
export default OrderRouter;
