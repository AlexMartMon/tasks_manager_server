import { transporter } from "../config/nodeMailer";

interface AuthEmailInterface {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: AuthEmailInterface) => {
    try {
      await transporter.sendMail({
        from: `"UpTask" <${process.env.SMTP_EMAIL}>`,
        to: user.email,
        subject: "UpTask - Confirm your Email",
        text: "Hola, esto es una prueba desde mi servidor Express.",
        html: `<p>Hello: ${user.name}, you have create your account at MemoTask, 
                  everything is almost done, Last step, you must confirm your email in the following 10 minutes</p>
                  <p>Click on the following link to confirm it:</p>
                  <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account.</a>
                  <p>Writte the following code: <b>${user.token}</b></p>
                  `,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  static sendResetPasswordEmail = async (user: AuthEmailInterface) => {
    try {
        await transporter.sendMail({
            from: `"UpTask" <${process.env.SMTP_EMAIL}>`,
            to: user.email,
            subject: "UpTask - Confirm your Email",
            text: "UpTask - Reset password link ",
            html: `<p>Hello: ${user.name}, You have request a password reset, click on the following link
                   to set your new one, in case you did not request us to ignore this email</p>
                  <p>Click on the following link to confirm it:</p>
                  <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset password.</a>
                  <p>Writte the following code: <b>${user.token}</b></p>
                  <p>This token expire at the following 10 minutes</p>
                  `,
          });
        return true;
    } catch (error) {
        return false;
    }
    
  };
}
