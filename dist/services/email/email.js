"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});
const renderEmailTemplate = (templateName, data) => {
    const templatePath = path_1.default.join(process.cwd(), 'templates', `${templateName}.pug`);
    return pug_1.default.renderFile(templatePath, data);
};
const sendEmail = async ({ recipientEmail, templateName, subject, data, }) => {
    return transporter.sendMail({
        from: `"paywave" <${process.env.EMAIL}>`,
        to: recipientEmail,
        subject,
        html: renderEmailTemplate(templateName, data),
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map