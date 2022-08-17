/* eslint-disable node/no-unsupported-features/es-syntax */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        // eslint-disable-next-line no-unused-expressions
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Tulasi Ram Reddy <${process.env.EMAIL_FROM}>`;
    }
    // eslint-disable-next-line lines-between-class-members
    createTransport() {
        if (process.env.NODE_ENV === 'production') {
            // sandgrid
            return 1;
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );
        const mailOptions = {
            from: `Tulasi ram reddy <${process.env.EMAIL_FROM}>`,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        await this.createTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to natours family');
    }

    async passwordResetToken() {
        await this.send(
            'passwordReset',
            'Your Password Rest Token(Valid for 10 min only)'
        );
    }
};
