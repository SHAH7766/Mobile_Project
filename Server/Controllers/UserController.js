import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { User } from "../Models/User.model.js"

const removePassword = (user) => {
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}

export const RegisterUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { email },
                { name }
            ]
        })

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email ? "Email is already in use" : "Name is already in use"
            })
        }

        const userCount = await User.countDocuments()
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userCount === 0 ? "admin" : role
        })

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: removePassword(user)
        })
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field"

            return res.status(409).json({
                success: false,
                message: `${field} is already in use`
            })
        }

        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        })
    }
}

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email: String(email).trim().toLowerCase() })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        )

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: removePassword(user)
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error logging in user",
            error: error.message
        })
    }
}

export const GetUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            users
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        })
    }
}

export const GetProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            user
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message
        })
    }
}

export const GetUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            user
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        })
    }
}

export const UpdateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const { name, email, password, role } = req.body

        if ((email && email !== user.email) || (name && name !== user.name)) {
            const conditions = []

            if (email && email !== user.email) conditions.push({ email })
            if (name && name !== user.name) conditions.push({ name })

            const existingUser = await User.findOne({
                _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
                $or: conditions
            })

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: existingUser.email === email ? "Email is already in use" : "Name is already in use"
                })
            }
        }

        if (name) user.name = name
        if (email) user.email = email
        if (role) user.role = role
        if (password) user.password = await bcrypt.hash(password, 10)

        await user.save()

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: removePassword(user)
        })
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field"

            return res.status(409).json({
                success: false,
                message: `${field} is already in use`
            })
        }

        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        })
    }
}

export const DeleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        await user.deleteOne()

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        })
    }
}
