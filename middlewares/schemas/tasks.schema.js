import joi from 'joi';

export default {
    create: joi.object({
        title: joi.string()
            .min(1)
            .max(255)
            .required()
            .messages({
                'string.empty': 'Заголовок задачи обязателен',
                'any.required': 'Заголовок задачи обязателен',
                'string.min': 'Заголовок должен содержать хотя бы 1 символ',
                'string.max': 'Заголовок не может быть длиннее 255 символов'
            }),

        description: joi.string()
            .allow('')
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Описание не может быть длиннее 1000 символов'
            }),

        taskDate: joi.date()
            .iso()
            .required()
            .messages({
                'date.base': 'Дата задачи должна быть в формате ISO (YYYY-MM-DD)',
                'date.format': 'Дата должна быть в формате YYYY-MM-DD',
                'any.required': 'Дата задачи обязательна'
            }),

        details: joi.object({
            priority: joi.string()
                .valid('low', 'medium', 'high')
                .allow(null, '')
                .optional()
                .messages({
                    'any.only': 'Приоритет может быть только "low", "medium" или "high"',
                    'string.base': 'Приоритет должен быть строкой'
                }),

            location: joi.string()
                .allow(null, '')
                .max(255)
                .optional()
                .messages({
                    'string.max': 'Местоположение не может быть длиннее 255 символов'
                }),

            notes: joi.string()
                .allow(null, '')
                .max(500)
                .optional()
                .messages({
                    'string.max': 'Заметки не могут быть длиннее 500 символов'
                })
        })
            .optional()
            .unknown(false)
            .messages({
                'object.unknown': 'В details обнаружены некорректные поля'
            })
    })
        .unknown(false)
        .messages({
            'object.unknown': 'Обнаружены некорректные поля в запросе'
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
    param: joi.object({
        id: joi.number()
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
    }),

}