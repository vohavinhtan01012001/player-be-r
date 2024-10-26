import nodemailer from "nodemailer";
import { emailConfig } from "../config/config";
import { forgotPasswordMailTemplate, mailTemplate } from "./mailTemplate";
import { OAuth2Client } from "google-auth-library";
import Mail from "nodemailer/lib/mailer";

const myOAuth2Client = new OAuth2Client(
  emailConfig.clientId,
  emailConfig.clientSecret
);

myOAuth2Client.setCredentials({
  refresh_token: emailConfig.refreshToken,
});

const accessToken = async () => {
  const myAccessTokenObject = await myOAuth2Client.getAccessToken();
  const myAccessToken = myAccessTokenObject?.token;
  return myAccessToken;
};


const transporterOptions: any = {
  service: "Gmail",
  auth: {
    type: "OAuth2",
    user: emailConfig.emailAddress,
    clientId: emailConfig.clientId,
    clientSecret: emailConfig.clientSecret,
    refreshToken: emailConfig.refreshToken,
    accessToken: accessToken,
    name: "Player Web Application",
  },
};

export const transporter: Mail = nodemailer.createTransport(transporterOptions);

export const sendOTP = (email: string, otp: string) => {
  return sendMail({
    to: email,
    html: forgotPasswordMailTemplate({ otp }),
    subject: "OTP Verification",
  });
};
export const sendMail = (exports.sendMail = function (details: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  cc?: any;
  bcc?: any;
  from?: string;
}) {
  const mailOptions = {
    to: details.to,
    subject: details.subject,
    html: details.html,
    attachments: details.attachments || [],
    cc: details.cc || null,
    bcc: details.bcc || null,
    from: details.from || emailConfig.emailFrom,
  };

  return new Promise(function (resolve, reject) {
    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

exports.sendMessage = (
  email: string,
  messageBody: any,
  attachment: any[] = []
) => {
  return sendMail({
    to: email,
    attachments: attachment,
    subject: messageBody.subject,
    html: mailTemplate(messageBody.subject, messageBody.body),
  });
};
