import joi from 'joi';

export default {
    create: joi.object({
        title: joi.string()
            .trim()
            .min(1)
            .max(255)
            .required()
            .messages({
                'string.empty': 'Поле title не может быть пустым',
                'string.min': 'Поле title должно содержать хотя бы 1 символ',
                'string.max': 'Поле title не может быть длиннее 255 символов',
                'any.required': 'Поле title обязательно'
            }),

        description: joi.string()
            .allow('', null)
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Поле description не может быть длиннее 1000 символов'
            }),

        taskDate: joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .custom((value, helpers) => {
                const date = new Date(value);
                const isValidDate = !isNaN(date.getTime());
                const isSameFormat = date.toISOString().split('T')[0] === value;

                if (!isValidDate || !isSameFormat) {
                    return helpers.error('any.invalid');
                }
                return value;
            }, 'valid date format YYYY-MM-DD')
            .messages({
                'string.pattern.base': 'Поле taskDate должно быть в формате "ГГГГ-ММ-ДД"',
                'string.empty': 'Поле taskDate не может быть пустым',
                'any.invalid': 'Поле taskDate содержит некорректную дату',
                'any.required': 'Поле taskDate обязательно'
            })
    })
}