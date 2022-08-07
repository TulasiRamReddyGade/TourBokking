/* eslint-disable node/no-unsupported-features/es-syntax */
const nodemailer = require('nodemailer');

const sendMail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailOptions = {
        from: 'Tulasi ram reddy <admin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    };

    await transporter.sendMail(emailOptions);
};

module.exports = sendMail;
