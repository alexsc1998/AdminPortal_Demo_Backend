import nodemailer from 'nodemailer';
import { resetPasswordEmailTemplate } from './reset-password-email-template.js';
import { activationEmailTemplate } from './activation-email-template.js';
import { fileURLToPath } from 'url';
import path from 'path';
import QRCode from 'qrcode';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const generateQRCode = async (data: string) => {
  try {
    const options = {
      margin: 1,
      scale: 4, // Adjust scale to get the desired size
      width: 160 // Explicitly set the width
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, options);
    return qrCodeDataURL;
  } catch (err) {
    console.error(err);
    return "";
  }
};

const message = async ({
  id,
  name,
  email,
  subject,
  expireDate
}: {
  id: string;
  name: string;
  email: string;
  subject: string;
  expireDate: string;
}) => {
  const link = `${process.env.FRONT_END_URL}/portal/onboarding/check/${id}`;
  console.log("Link", link);
  const qrData = await generateQRCode(link);

  const accActivation = activationEmailTemplate({
    name,
    expireDate,
    qrData,
    link: `${process.env.FRONT_END_URL}/portal/onboarding/check/${id}`,
  });

  return {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    text: 'For clients with plaintext support only',
    html: accActivation,
    attachments: [
      {
        path: qrData,
        cid: 'qrCodeImage'
      },
    ],
  };
};
// const msg = {
//   to: 'alexlim@mmdt.cc', // Change to your recipient
//   from: 'aewnetu21@gmail.com', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: ' <p>Please follow this <a href="https://user-management-fe-five.vercel.app/set-password?token=${token}">link</a> to set your password.</p>',
// };
// function sendEmail() {
//   sgMail
//     .send(msg)
//     .then(() => {
//       console.log('Email sent');
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }
const transport = nodemailer.createTransport({
  host:
    process.env.NODE_ENV === 'development'
      ? process.env.EMAIL_HOST_LOCAL
      : process.env.EMAIL_HOST,
  port:
    process.env.NODE_ENV === 'development'
      ? Number(process.env.EMAIL_PORT_LOCAL)
      : Number(process.env.EMAIL_PORT),
  auth: {
    user:
      process.env.NODE_ENV === 'development'
        ? process.env.EMAIL_USER_LOCAL
        : process.env.EMAIL_USER,
    pass:
      process.env.NODE_ENV === 'development'
        ? process.env.EMAIL_PASS_LOCAL
        : process.env.EMAIL_PASS,
  },
});

export { transport, message };
