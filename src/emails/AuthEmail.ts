import { transporter } from "../config/nodeMailer"

interface AuthEmailInterface {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async (user: AuthEmailInterface) => {
        await transporter.sendMail({
            from: 'MemoTask <admin@memotask.com>',
            to: user.email,
            subject: 'MemoTask - Confirm your Email',
            text: 'Memo Task - confirm your email ',
            html: `<p>Hello: ${user.name}, you have create your account at MemoTask, 
            everything is almost done, Last step, you must confirm your email in the following 10 minutes</p>
            <p>Click on the following link to confirm it:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account.</a>
            <p>Writte the following code: <b>${user.token}</b></p>
            `
        })
    }

    static sendResetPasswordEmail = async (user: AuthEmailInterface) => {
        await transporter.sendMail({
            from: 'MemoTask <admin@memotask.com>',
            to: user.email,
            subject: 'MemoTask - Reset your Password',
            text: 'Memo Task - reset password link ',
            html: `<p>Hello: ${user.name}, You have request a password reset, click on the following link
             to set your new one, in case you did not request us to ignore this email</p>
            <p>Click on the following link to confirm it:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password.</a>
            <p>Writte the following code: <b>${user.token}</b></p>
            <p>This token expire at the following 10 minutes</p>
            `
        })
    }
}