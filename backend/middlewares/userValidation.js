const { body, validationResult } = require('express-validator');

const validateCreateUser = [
    body('username').isString().isLength({min: 3, max: 100}).withMessage("username must be within 3 to 100 characters long"),
    body('email').isEmail().withMessage("email must be a valid email address"),
    body('password').isString().isLength({min: 6}).withMessage("password must be 6 characters long"),
    body('profile_picture_path').optional(),

    (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}
];

const validateUpdateUser = [
    body('username')
        .optional()
        .isString()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters long'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address'),

    body('phone_number')
        .optional()
        .isString()
        .isLength({ min: 3, max: 20 })
        .withMessage('Phone number must be 3-20 characters long'),

    body('profile_picture_path')
        .optional()
        .isString(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateUser,
    validateUpdateUser
};