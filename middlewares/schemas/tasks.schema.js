import joi from 'joi';

export default {
    create: joi.object({
        taskTitle: joi.string()
            .min(1)
            .max(255)
            .required()
            .messages({
                'string.empty': 'Заголовок задачи обязателен',
                'any.required': 'Заголовок задачи обязателен',
                'string.min': 'Заголовок должен содержать хотя бы 1 символ',
                'string.max': 'Заголовок не может быть длиннее 255 символов'
            }),

        taskDescription: joi.string()
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
            tasksPriority: joi.string()
                .valid('low', 'medium', 'high')
                .allow(null, '')
                .optional()
                .messages({
                    'any.only': 'Приоритет может быть только "low", "medium" или "high"',
                    'string.base': 'Приоритет должен быть строкой'
                }),

            tasksLocation: joi.string()
                .allow(null, '')
                .max(255)
                .optional()
                .messages({
                    'string.max': 'Местоположение не может быть длиннее 255 символов'
                }),

            tasksNotes: joi.string()
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
        }), list: joi.object({
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
    }), param: joi.object({
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

    update: joi.object({
        taskTitle: joi.string()
            .trim()
            .allow('')
            .messages({
                'string.base': 'Заголовок должен быть строкой',
                'string.trim': 'Заголовок не должен содержать лишних пробелов'
            }),

        taskDescription: joi.string()
            .trim()
            .allow('')
            .messages({
                'string.base': 'Описание должно быть строкой',
                'string.trim': 'Описание не должно содержать лишних пробелов'
            }),

        taskDate: joi.string()
            .isoDate()
            .allow('')
            .messages({
                'string.base': 'Дата задачи должна быть строкой',
                'string.isoDate': 'Дата задачи должна быть в формате ISO (YYYY-MM-DD)',
                'any.empty': 'Дата задачи не может быть пустой строкой'
            }),

        taskCompleted: joi.boolean()
            .truthy('true', '1', 'yes', 'on')
            .falsy('false', '0', 'no', 'off')
            .default(false)
            .messages({
                'boolean.base': 'Статус выполнения должен быть булевым значением',
                'boolean.truthy': 'Недопустимое значение для статуса выполнения (истина)',
                'boolean.falsy': 'Недопустимое значение для статуса выполнения (ложь)'
            }),

        details: joi.object({
            tasksNotes: joi.string()
                .trim()
                .allow('')
                .messages({
                    'string.base': 'Заметки должны быть строкой',
                    'string.trim': 'Заметки не должны содержать лишних пробелов'
                }),

            tasksLocation: joi.string()
                .trim()
                .allow('')
                .messages({
                    'string.base': 'Местоположение должно быть строкой',
                    'string.trim': 'Местоположение не должно содержать лишних пробелов'
                }),

            tasksPriority: joi.string()
                .valid('low', 'medium', 'high')
                .allow('')
                .messages({
                    'string.base': 'Приоритет должен быть строкой',
                    'any.only': 'Приоритет может быть только "low", "medium" или "high"',
                    'any.empty': 'Приоритет не может быть пустым'
                })
        })
            .optional().unknown(false)
            .messages({
                'object.base': 'Детали должны быть объектом'
            })

    })

}