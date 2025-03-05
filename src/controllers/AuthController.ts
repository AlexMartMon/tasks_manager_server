import type { Request, Response } from "express";
import Auth from "../models/Auth";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static postCreateAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //Validate duplicate emails
      const userExist = await Auth.findOne({ email });
      if (userExist) {
        const error = new Error(
          "Current email already registed, try again with another email."
        );
        return res.status(409).json({ error: error.message });
      }

      const user = new Auth(req.body);

      //Hash password
      user.password = await hashPassword(password);

      //generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //Send Email
      const response = await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      if (!response) {
        return res.status(401).json({ error: "Error sending email." });
      }

      await Promise.allSettled([user.save(), token.save()]);
      res
        .status(201)
        .send(
          "Account created succesfully! check your email to confirm your account."
        );
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postConfirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Invalid Token");
        return res.status(404).json({ error: error.message });
      }
      const user = await Auth.findById(tokenExist.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.status(200).send("Account confirmed");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await Auth.findOne({ email });
      if (!user) {
        const error = new Error("User not found.");
        return res.status(404).json({ error: error.message });
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "User email not confirmed yet. We've sent you a email to validateit, check your emails."
        );
        return res.status(401).json({ error: error.message });
      }

      //validate password
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Invalid password.");
        return res.status(401).json({ error: error.message });
      }
      const token = generateJWT({ id: user.id });

      res.status(200).send(token);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postRequestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //Validate duplicate emails
      const user = await Auth.findOne({ email });
      if (!user) {
        const error = new Error("Current email is not registed.");
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed) {
        const error = new Error("Your account is already confirmed.");
        return res.status(403).json({ error: error.message });
      }

      //generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //Send Email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.status(200).send("A new token have been sent to your email.");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postNewPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //Validate duplicate emails
      const user = await Auth.findOne({ email });
      if (!user) {
        const error = new Error("Current email is not registed.");
        return res.status(404).json({ error: error.message });
      }

      //generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();
      //Send Email
      const response = await AuthEmail.sendResetPasswordEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      if (!response)
        return res.status(401).json({ error: "Error sending email." });

      res.status(200).send("Check your email to reset your password.");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postValidateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Invalid Token");
        return res.status(404).json({ error: error.message });
      }
      await tokenExist.save();
      res.status(200).send("Valid Code, writte your new password");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postResetPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Invalid Token");
        return res.status(404).json({ error: error.message });
      }

      const user = await Auth.findById(tokenExist.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.status(200).send("Password changed succesfully.");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getUser = async (req: Request, res: Response) => {
    return res.status(200).json(req.user);
  };

  static putUpdateUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExist = await Auth.findOne({ email });
    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error("Email already on use.");
      return res.status(409).json({ error: error.message });
    }
    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.status(200).send("Profile updated succesfully.");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postUpdatePassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await Auth.findById(req.user.id);
    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("Your current password is incorrect.");
      return res.status(401).json({ error: error.message });
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.status(200).send("Password changed succesfully.");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static postCheckPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await Auth.findById(req.user.id);
    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("Your password is incorrect.");
      return res.status(401).json({ error: error.message });
    }
    res.status(200).send("Correct password.");
  };
}
