import express from 'express'
import {
    DeleteUser,
    GetProfile,
    GetUserById,
    GetUsers,
    LoginUser,
    RegisterUser,
    UpdateUser
} from "../Controllers/UserController.js"
import { verifyToken } from "../Middleware/AuthMiddleware.js"
import {
    validateObjectId,
    validateUserCreate,
    validateUserLogin,
    validateUserUpdate
} from "../Middleware/ValidationMiddleware.js"

const router = express.Router()

router.get("/", GetUsers)
router.post("/register", validateUserCreate, RegisterUser)
router.post("/login", validateUserLogin, LoginUser)
router.get("/profile", verifyToken, GetProfile)
router.get("/:id", validateObjectId, GetUserById)
router.put("/:id", validateObjectId, validateUserUpdate, UpdateUser)
router.delete("/:id", validateObjectId, DeleteUser)

export default router
