
import { Orders } from '../Models/Order.model.js'
import { Product } from '../Models/Product.model.js'
export const CreateOrder = async (req, res) => {
    try {
        const { items, shippingAddress } = req.body
        const productIds = items.map((item) => item.productId)
        const products = await Product.find({ _id: { $in: productIds } })
        const productsById = new Map(products.map((product) => [product._id.toString(), product]))

        const orderItems = items.map((item) => {
            const product = productsById.get(item.productId)

            if (!product) {
                const error = new Error(`Product with ID ${item.productId} not found`)
                error.statusCode = 404
                throw error
            }

            const quantity = Number(item.quantity)

            return {
                productId: item.productId,
                name: product.name, 
                quantity,
                price: product.price
            }
        })
        const totalAmount = orderItems.reduce((total, item) => {
            return total + item.price * item.quantity
        }, 0)

        const order = new Orders({
            userId: req.user.id,        
            items: orderItems,
            totalAmount,
            shippingAddress
        })
        await order.save()
        res.status(201).json({
            success: true,
            order
        })
    }   
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: "Error creating order",
            error: error.message
        })
    }
}

export const GetUserOrders = async (req, res) => {
    try {
        const orders = await Orders.find({ userId: req.user.id }).populate('items.productId', 'name price')
        res.status(200).json({
            success: true,
            orders
        })
    }   
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        })
    }
}
