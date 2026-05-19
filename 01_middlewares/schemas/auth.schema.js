import joi from 'joi';

export default {
    login: joi.object({
        email: joi.string().required().messages({
            'string.empty': 'Email обязателен',
            'string.email': 'Email должен быть корректным',
        }),
        password: joi.string().min(4).max(32).required().messages({
            'string.empty': 'Пароль обязателен',
        }),

    }).unknown(false).messages({
        'object.unknown': 'некоректные данные'
    }),
    register: joi.object({
        username: joi.string().min(3).max(50).required().messages({
            'string.empty': 'Имя обязательно'
        }),
        email: joi.string().email().min(5).max(100).required().messages({
            'string.empty': 'Email обязателен',
            'string.email': 'Email должен быть корректным',
        }),
        password: joi.string().min(6).max(255).required().messages({
            'string.empty': 'Пароль обязателен',
        }),
    }).unknown(false).messages({
        'object.unknown': 'некоректные данные'
    })
}