const nodemailer = require('nodemailer');

const HOST = process.env.EMAIL_HOST;
const PORT = process.env.EMAIL_PORT;
const USERNAME = process.env.EMAIL_USERNAME;
const PASSWORD =process.env.EMAIL_PASSWORD;

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: `${HOST}`,
        port: PORT,
        auth: {
            user: `${USERNAME}`,
            pass: `${PASSWORD}`
        }
    });
    const emailOptions = {
        from: 'Natours Team <admin@gmail.com>',
        to: options.sendToEmail,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;