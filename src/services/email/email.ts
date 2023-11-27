import nodemailer from 'nodemailer';
import pug from 'pug';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const renderEmailTemplate = (templateName: string, data: { [key: string]: any }) => {
  const templatePath = path.join(process.cwd(), 'templates', `${templateName}.pug`);
  return pug.renderFile(templatePath, data);
};

const sendEmail = async ({
  recipientEmail,
  templateName,
  subject,
  data,
}: {
  recipientEmail: string;
  templateName: string;
  subject: string;
  data: { [key: string]: any };
}) => {
  return transporter.sendMail({
    from: `"paywave" <${process.env.EMAIL}>`,
    to: recipientEmail,
    subject,
    html: renderEmailTemplate(templateName, data),
  });
};

export { sendEmail };
