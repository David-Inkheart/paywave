import nodemailer from 'nodemailer';
import pug from 'pug';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  // host: 'davidokolie.me',
  // port: 465,
  // secure: true,
  // auth: {
  //   user: process.env.EMAIL,
  //   pass: process.env.EMAIL_PASS,
  // },
});

const selectTemplateFromPurpose = ({ purpose, username }: { purpose: string; username: string }) => {
  if (purpose === 'welcome') {
    return pug.renderFile(`${process.cwd()}/templates/welcome.pug`, { username });
  }
  return pug.renderFile(`${process.cwd()}/templates/resetPassword.pug`, { username });
};

const sendEmail = async ({ recipientEmail, purpose, username }: { recipientEmail: string; purpose: string; username: string }) => {
  return transporter.sendMail({
    from: `"paywave" <${process.env.EMAIL}>`, // sender address
    to: recipientEmail, // list of receivers
    subject: purpose === 'welcome' ? 'Welcome to paywave' : 'Password Reset Confirmation', // Subject line
    html: selectTemplateFromPurpose({ username, purpose }), // html body
  });
};

export { sendEmail };
