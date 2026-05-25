const objectIdRegex = /^[0-9a-fA-F]{24}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const specialCharacterRegex = /[^A-Za-z0-9]/
const allowedRoles = ["user", "admin"]

const isBlank = (value) => {
    return value === undefined || value === null || String(value).trim() === ""
}

const sendValidationErrors = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
    })
}

const hasStrongPassword = (password) => {
    return String(password).length >= 8 && specialCharacterRegex.test(password)
}

export const validateObjectId = (req, res, next) => {
    if (!objectIdRegex.test(req.params.id)) {
        return sendValidationErrors(res, ["Invalid id"])
    }

    next()
}

export const validateUserCreate = (req, res, next) => {
    const errors = []
    const { name, email, password, role } = req.body

    if (isBlank(name)) errors.push("Name is required")
    if (isBlank(email)) errors.push("Email is required")
    if (isBlank(password)) errors.push("Password is required")
    if (!isBlank(email) && !emailRegex.test(email)) errors.push("Email is invalid")
    if (!isBlank(password) && !hasStrongPassword(password)) {
        errors.push("Password must be at least 8 characters long and contain a special character")
    }
    if (!isBlank(role) && !allowedRoles.includes(role)) errors.push("Role must be user or admin")

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    next()
}

export const validateUserLogin = (req, res, next) => {
    const errors = []
    const { email, password } = req.body

    if (isBlank(email)) errors.push("Email is required")
    if (isBlank(password)) errors.push("Password is required")
    if (!isBlank(email) && !emailRegex.test(email)) errors.push("Email is invalid")

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    next()
}

export const validateUserUpdate = (req, res, next) => {
    const errors = []
    const allowedFields = ["name", "email", "password", "role"]
    const sentFields = allowedFields.filter((field) => req.body[field] !== undefined)
    const { name, email, password, role } = req.body

    if (sentFields.length === 0) errors.push("At least one user field is required")
    if (name !== undefined && isBlank(name)) errors.push("Name cannot be empty")
    if (email !== undefined && isBlank(email)) errors.push("Email cannot be empty")
    if (password !== undefined && isBlank(password)) errors.push("Password cannot be empty")
    if (!isBlank(email) && !emailRegex.test(email)) errors.push("Email is invalid")
    if (!isBlank(password) && !hasStrongPassword(password)) {
        errors.push("Password must be at least 8 characters long and contain a special character")
    }
    if (!isBlank(role) && !allowedRoles.includes(role)) errors.push("Role must be user or admin")

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    next()
}

export const validateProductCreate = (req, res, next) => {
    const errors = []
    const { name, description, price, category } = req.body
    const numericPrice = Number(price)

    if (isBlank(name)) errors.push("Product name is required")
    if (isBlank(description)) errors.push("Product description is required")
    if (isBlank(price)) errors.push("Product price is required")
    if (!isBlank(price) && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
        errors.push("Product price must be greater than 0")
    }
    if (isBlank(category)) errors.push("Product category is required")
    if (!req.file) errors.push("Product image is required")

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    next()
}

export const validateProductUpdate = (req, res, next) => {
    const errors = []
    const allowedFields = ["name", "description", "price", "category"]
    const sentFields = allowedFields.filter((field) => req.body[field] !== undefined)
    const { name, description, price, category } = req.body
    const numericPrice = Number(price)

    if (sentFields.length === 0 && !req.file) errors.push("At least one product field or image is required")
    if (name !== undefined && isBlank(name)) errors.push("Product name cannot be empty")
    if (description !== undefined && isBlank(description)) errors.push("Product description cannot be empty")
    if (category !== undefined && isBlank(category)) errors.push("Product category cannot be empty")
    if (price !== undefined && (isBlank(price) || !Number.isFinite(numericPrice) || numericPrice <= 0)) {
        errors.push("Product price must be greater than 0")
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    next()
}
