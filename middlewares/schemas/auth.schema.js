import joi from 'joi';

export default {
    login: joi.object({
        userEmail: joi.string().required().messages({
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
        userName: joi.string().min(3).max(50).required().messages({
            'string.empty': 'Имя обязательно'
        }),
        userAge: joi.number().integer().min(6).max(120).required().messages({
                'number.base': 'Возраст должен быть числом',
                'number.integer': 'Возраст должен быть целым числом',
                'number.min': 'Возраст не может быть меньше 6',
                'number.max': 'Возраст не может быть больше 120',
                'any.required': 'Возраст обязателен',
                'string.empty': 'Возраст обязателен',
            }),
        userEmail: joi.string().email().min(5).max(100).required().messages({
            'string.empty': 'Email обязателен',
            'string.email': 'Email должен быть корректным',
        }),
        password: joi.string().min(6).max(255).required().messages({
            'string.empty': 'Пароль обязателен',
        }),
    }).unknown(false).messages({
        'object.unknown': 'некоректные данные'
    }),
    update: joi.object({
        userName: joi.string().min(3).max(50).messages({
            'string.empty': 'Имя обязательно'
        }),
        userAge: joi.number().integer().min(6).max(120).messages({
            'number.base': 'Возраст должен быть числом',
            'number.integer': 'Возраст должен быть целым числом',
            'number.min': 'Возраст не может быть меньше 6',
            'number.max': 'Возраст не может быть больше 120',
            'any.required': 'Возраст обязателен',
            'string.empty': 'Возраст обязателен',
        }),

    }).unknown(false).messages({
        'object.unknown': 'некоректные данные'
    }),
    list: joi.object({
        page: joi.number()
            .integer()
            .min(1)
            .max(1000)
            .default(1)
            .messages({
                'number.base': 'Страница должна быть числом',
                'number.integer': 'Страница должна быть целым числом',
                'number.min': 'Страница должна быть не меньше 1',
                'number.max': 'Страница слишком большая',
            }),

        limit: joi.number()
            .integer()
            .min(1)
            .max(50)
            .default(10)
            .messages({
                'number.base': 'Лимит должен быть числом',
                'number.integer': 'Лимит должен быть целым числом',
                'number.min': 'Лимит должен быть не меньше 1',
                'number.max': 'Лимит должен быть не больше 50',
            }),
    }),
}