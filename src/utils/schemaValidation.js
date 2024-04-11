import Joi from 'joi';


export const RegistrationValidation = Joi.object({
    name: Joi.string().min(2).max(15).required(),
    email:Joi.string().email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required(),
    password: Joi.string().min(2).required(),
})

export const LoginValidation = Joi.object({
    email:Joi.string().email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required(),
    password: Joi.string().required()
});

export const ProductValidation = Joi.object({
    name: Joi.string().required(),
    qty: Joi.number().integer().min(1).required(),
    rate: Joi.number().min(0).required(),
    gst: Joi.number().min(0).default(18), // GST validation
});

export const QuotationValidation = Joi.object({
    user: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // Assuming user ID is a MongoDB ObjectId
    date: Joi.date().iso().default(Date.now), // Default to current date
    products: Joi.array().items(ProductValidation).min(1).required(), // Array of products validation
});