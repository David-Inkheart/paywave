import nodemailer from 'nodemailer';
import pug from 'pug';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const selectTemplateFromPurpose = ({ purpose, businessName }: { purpose: string; businessName: string }) => {
  if (purpose === 'welcome') {
    return pug.renderFile(`${process.cwd()}/templates/welcome.pug`, { businessName });
  }
  return pug.renderFile(`${process.cwd()}/templates/resetPassword.pug`, { businessName });
};

const sendEmail = async ({ recipientEmail, purpose, businessName }: { recipientEmail: string; purpose: string; businessName: string }) => {
  return transporter.sendMail({
    from: `"paywave" <${process.env.EMAIL}>`, // sender address
    to: recipientEmail, // list of receivers
    subject: purpose === 'welcome' ? 'Welcome to paywave' : 'Password Reset Confirmation', // Subject line
    html: selectTemplateFromPurpose({ businessName, purpose }), // html body
  });
};

export { sendEmail };
