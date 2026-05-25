import cloudinary from "../Config/Cloudinary.js"
import { Product } from "../Models/Product.model.js"

const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "food_app/products",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error)
                    return
                }

                resolve(result)
            }
        )

        uploadStream.end(fileBuffer)
    })
}

const deleteImageFromCloudinary = async (publicId) => {
    if (!publicId) {
        return
    }

    await cloudinary.uploader.destroy(publicId)
}

export const CreateProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required"
            })
        }

        const uploadedImage = await uploadImageToCloudinary(req.file.buffer)

        const product = await Product.create({
            name,
            description,
            price,
            category,
            imageUrl: uploadedImage.secure_url,
            imagePublicId: uploadedImage.public_id
        })

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        })
    }
}

export const GetProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            products
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        })
    }
}

export const GetProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(200).json({
            success: true,
            product
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        })
    }
}

export const UpdateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        const { name, description, price, category } = req.body

        if (name) product.name = name
        if (description) product.description = description
        if (price) product.price = price
        if (category) product.category = category

        if (req.file) {
            const oldImagePublicId = product.imagePublicId
            const uploadedImage = await uploadImageToCloudinary(req.file.buffer)

            product.imageUrl = uploadedImage.secure_url
            product.imagePublicId = uploadedImage.public_id

            await deleteImageFromCloudinary(oldImagePublicId)
        }

        await product.save()

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        })
    }
}

export const DeleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        await deleteImageFromCloudinary(product.imagePublicId)
        await product.deleteOne()

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        })
    }
}
