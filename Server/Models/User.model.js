import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleUser
        }
    },
    avatar: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    firebaseToken: { type: String, default: null }
}, { timestamps: true })
export const User = mongoose.model('User', userSchema)
