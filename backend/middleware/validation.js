const Joi = require('joi');

const validate = (schema) => ({
    before: async (request) =>{
        try{
            const body = JSON.parse(request.event.body)
            const { error } = schema.validate(body)
            if(error){
                return{
                    statusCode: 400,
                    body: JSON.stringify({msg: error.details[0].message}),
                    msg: "Something went wrong"
                }
            }
            return request.response

        } catch (err) {
            request.event.error = "401"
            return request.response
        }
    }
})

const userSchema = Joi.object({
    firstName: Joi.string().min(3).max(20).required().messages({
        'string.empty': 'First name cannot be empty',
        'string.min': 'First name should have a minimum length of 3',
        'string.max': 'First name should have a maximum length of 20',
        'any.required': 'First name is a required field'
    }),
    lastName: Joi.string().min(3).max(20).required().messages({
        'string.empty': 'Last name cannot be empty',
        'string.min': 'Last name should have a minimum length of 3',
        'string.max': 'Last name should have a maximum length of 20',
        'any.required': 'Last name is a required field'
    }),
    userName: Joi.string().min(3).max(20).required().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username should have a minimum length of 3',
        'string.max': 'Username should have a maximum length of 20',
        'any.required': 'Username is a required field'
    }),
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters contain at least one uppercase letter, one lowercase, one digit and one special character',
            'any.required': 'Password is a required field'
        }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is a required field'
    })
})

const loginSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
})

const passChangeSchema = Joi.object({
    password: Joi.string().required(),
    newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
    .required()
    .messages({
        'string.pattern.base': 'Password must be at least 8 characters contain at least one uppercase letter, one lowercase, one digit and one special character',
        'any.required': 'Password is a required field'
    }),
    retypePassword: Joi.string().required()
})

const validateInfoChange = Joi.object({
    firstName: Joi.string().min(3).max(20),
    lastName: Joi.string().min(3).max(20),
    email: Joi.string().email()
})

const validateApproveUser = Joi.object({
    userName: Joi.string().required()
})

const validateAddSession = Joi.object({
    date: Joi.string().required(),
    time: Joi.string().required(),
    booked: Joi.boolean().required(),
    bookedBy: Joi.string().required()
})


export const validateSession = validate(validateAddSession)
export const validateApprove = validate(validateApproveUser)
export const validateInfo = validate(validateInfoChange)
export const validatePassChange = validate(passChangeSchema)
export const validateLogin = validate(loginSchema)
export const validateUser = validate(userSchema)