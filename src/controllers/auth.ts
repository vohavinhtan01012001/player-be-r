import {
  createUser,
  findOneUser,
  updateUserById,
  userExists,
  validatePassword,
} from "../services/userService";
import { NextFunction, Request, Response } from "express";
import { omit } from "lodash";
import { sign } from "../util/jwt";
import { generateOTP, verifyOTP } from "../util/otp";
import { sendOTP, transporter } from "../helpers/mailHelper";
import { ApiError } from "../util/ApiError";
import { findOnePlayer } from "../services/playerService";
import { SentMessageInfo } from "nodemailer";
import { clientConfig } from "../config/config";
import User from "../models/User";
import bcrypt from "bcrypt";
import { encryptSync } from "../util/encrypt";
const omitData = ["password"];

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let user = req.body;
    const userExist = await userExists({
      email: user.email,
    });
    if (userExist) {
      throw new ApiError(400, "Email is alredy used");
    }
    user = await createUser(user);
    const userData = omit(user?.toJSON(), omitData);
    const accessToken = sign({ ...userData });

    return res.status(200).json({
      data: userData,
      error: false,
      accessToken,
      msg: "User registered successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findOneUser({ email });
    if (!user) {
      throw new ApiError(400, "The email address you entered does not exist.");
    }

    // Check if user account is inactive
    if (user.status === 0) {
      throw new ApiError(403, "Your account has been deactivated. Please contact support.");
    }

    const player = await findOnePlayer({ email });

    // Check if player account is blocked or banned
    if (player && (player.status === 4 || player.status === 5)) {
      throw new ApiError(403, "Your player account is restricted. Please contact support.");
    }

    const validPassword = await validatePassword(user.email, password);
    
    if (!validPassword) {
      throw new ApiError(400, "The password you entered is incorrect.");
    }

    const userData = omit(user?.toJSON(), omitData);
    const accessToken = sign({ ...userData });

    return res.status(200).json({
      data: userData,
      accessToken: accessToken,
      error: false,
      msg: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};



// export const loginPlayer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, password } = req.body;

//     const player = await findOnePlayer({ email });
//     if (!player) {
//       throw new ApiError(400, "Email id is incorrect");
//     }

//     const validPassword = await validatePasswordPlayer(player.email, password);
//     if (!validPassword) {
//       throw new ApiError(400, "Password is incorrect");
//     }
//     const playerData = omit(player?.toJSON(), omitData);
//     const accessToken = sign({ ...playerData });

//     return res.status(200).json({
//       data: playerData,
//       accessToken: accessToken,
//       error: false,
//       msg: "Login successfully",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({where:{email: email}});
    if (!user) {
      return next(new ApiError(400, "Email id is incorrect"));
    }
    // Generate a secure hash for the password reset link (this should be implemented)
    const modifiedHash = user.password.replace(/\//g, "-");

    // Create mail options
    const mailOptions = {
      to: email,
      subject: "Đổi mật khẩu cho web", // Email subject
      html: `
        <html>
        <head>
          <style>
            .button {
              display: inline-block;
              font-size: 16px;
              font-weight: bold;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              background-color: #4CAF50;
              color: white;
              border-radius: 4px;
              border: none;
              cursor: pointer;
            }
            a {
              color: white;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <p>Xin chào!</p>
          <p>Bạn có thể nhấn vào nút bên dưới để đổi mật khẩu:</p>
          <a href="${clientConfig.clientUrl}/reset/${modifiedHash}" class="button">
            Đổi mật khẩu
          </a>
        </body>
        </html>
      ` // Email content
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond success
    return res.status(200).json({
      msg: "Email sent successfully",
      error: false,
    });
  } catch (err) {
    console.error("Error occurred while sending email:", err);
    return next(err); // Pass error to global error handler
  }
};


export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, password } = req.body;
    const modifiedHash = slug.replace(/-/g, "/");

    const user = await User.findOne({ where: { password: modifiedHash } });
    
    if (user) {
      const hash = await encryptSync(password);;
      await User.update(
        {
          password: hash,
        },
        { where: { id: user.id } }
      );
      return res.json({ status: 200, message: "Password updated successfully!" });
    } else {
      return res.status(404).json({ message: "Account not found" });
    }
  } catch (error) {
    return next(error);
  }
};