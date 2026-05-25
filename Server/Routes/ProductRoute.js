import express from 'express'
import multer from 'multer'
import {
    CreateProduct,
    DeleteProduct,
    GetProductById,
    GetProducts,
    UpdateProduct
} from "../Controllers/ProductController.js"
import {
    validateObjectId,
    validateProductCreate,
    validateProductUpdate
} from "../Middleware/ValidationMiddleware.js"

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"))
            return
        }

        cb(null, true)
    }
})

router.get("/", GetProducts)
router.get("/:id", validateObjectId, GetProductById)
router.put("/:id", validateObjectId, upload.single("image"), validateProductUpdate, UpdateProduct)
router.delete("/:id", validateObjectId, DeleteProduct)
router.post("/create", upload.single("image"), validateProductCreate, CreateProduct)
router.post("/", upload.single("image"), validateProductCreate, CreateProduct)

export default router
