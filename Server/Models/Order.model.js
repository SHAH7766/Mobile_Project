import mongoose from "mongoose"
const orderschema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })
export const Orders = mongoose.model('Orders', orderschema)
