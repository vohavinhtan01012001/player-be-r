import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { Dialect } from "sequelize";
export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  dialect: process.env.DB_TYPE as Dialect,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

export const jwtConfig = {
  secret: process.env.SECRET,
  expiry: process.env.TOKEN_EXPIRY_HOUR,
  saltRound: 3,
};

export const emailConfig = {
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_ADDRESS,
  emailAddress: process.env.EMAIL_ADDRESS,
  clientSecret: process.env.EMAIL_CLIENT_ID_SECRET,
  refreshToken: process.env.EMAIL_REFRESH_TOKEN,
  clientId: process.env.EMAIL_CLIENT_ID,
  emailFrom: process.env.EMAIL_FORM
};


export const otpConfig = {
  otpExpiry: process.env.OTP_EXPIRY_MIN,
  otpSecret: process.env.OTP_SECRET,
};


export const paymentConfig = {
  tmncode:process.env.PAYMENT_TMNCODE,
  hashsecret:process.env.PAYMENT_HASHSECRET,
  exchangeRateUSDToVND: process.env.PAYMENT_USD_TO_VND,
};

export const clientConfig = {
  clientUrl: process.env.CLIENT_URL,  
};