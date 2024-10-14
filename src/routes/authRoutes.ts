import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',
    body('name').notEmpty().withMessage('User name is obligatory.'),
    body('password').isLength({ min: 8 }).withMessage('Password is too short, minimun length is 8 characters.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Your passwords are not the same.')
        }
        return true
    }),
    body('email').isEmail().withMessage('Invalid Email.'),
    handleInputErrors,
    AuthController.postCreateAccount
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('Token is missed.'),
    handleInputErrors,
    AuthController.postConfirmAccount
)

router.post('/login',
    body('email').isEmail().withMessage('Invalid Email.'),
    body('password').notEmpty().withMessage('Password field is empty.'),
    handleInputErrors,
    AuthController.postLogin
)

router.post('/request-code',
    body('email').isEmail().withMessage('Invalid Email.'),
    handleInputErrors,
    AuthController.postRequestConfirmationCode
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('Invalid Email.'),
    handleInputErrors,
    AuthController.postNewPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('Token is missed.'),
    handleInputErrors,
    AuthController.postValidateToken
)

router.post('/reset-password/:token',
    param('token').isNumeric().withMessage('Invalid token.'),
    body('password').isLength({ min: 8 }).withMessage('Password is too short, minimun length is 8 characters.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Your passwords are not the same.')
        }
        return true
    }),
    handleInputErrors,
    AuthController.postResetPassword
)

router.get('/user',
    authenticate,
    AuthController.getUser
)

/**Profile */

router.put('/profile',
    authenticate,
    body('name').notEmpty().withMessage('User name is obligatory.'),
    body('email').isEmail().withMessage('Invalid Email.'),
    handleInputErrors,
    AuthController.putUpdateUser
)

router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('Current password can not be empty.'),
    body('password').isLength({ min: 8 }).withMessage('Password is too short, minimun length is 8 characters.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Your passwords are not the same.')
        }
        return true
    }),
    handleInputErrors,
    AuthController.postUpdatePassword
)

router.post('/check-password',
    authenticate,
    body('password').notEmpty().withMessage('Password can not be empty.'),
    handleInputErrors,
    AuthController.postCheckPassword
)

export default router