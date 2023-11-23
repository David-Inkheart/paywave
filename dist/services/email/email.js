"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const pug_1 = __importDefault(require("pug"));
const transporter = nodemailer_1.default.createTransport({
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
const selectTemplateFromPurpose = ({ purpose, username }) => {
    if (purpose === 'welcome') {
        return pug_1.default.renderFile(`${process.cwd()}/templates/welcome.pug`, { username });
    }
    return pug_1.default.renderFile(`${process.cwd()}/templates/resetPassword.pug`, { username });
};
const sendEmail = async ({ recipientEmail, purpose, username }) => {
    return transporter.sendMail({
        from: `"paywave" <${process.env.EMAIL}>`, // sender address
        to: recipientEmail, // list of receivers
        subject: purpose === 'welcome' ? 'Welcome to paywave' : 'Password Reset Confirmation', // Subject line
        html: selectTemplateFromPurpose({ username, purpose }), // html body
    });
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map