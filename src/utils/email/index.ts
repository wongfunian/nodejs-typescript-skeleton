import nodemailer, { Transporter } from 'nodemailer';
import 'dotenv/config';
import { google } from 'googleapis';
import { FRONTEND_URL } from '../../const';
const OAuth2 = google.auth.OAuth2;
const Oauth2_client = new OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET);
Oauth2_client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

/* EMAIL TEMPLATES */
import emailVerificationTemplate from './templates/emailVerification';
import resetPasswordTemplate from './templates/resetPassword';
import emailPasswordChanged from './templates/emailPasswordChanged';
import { PasswordChangedEmailTypes, PasswordResetEmailTypes, VerificationEmailTypes } from '../../types';

class EmailSender {
    private receiver: string | string[];
    private _emailTemplate?: {
        subject: string;
        content: string;
    };
    private transporter: Transporter;
    private name: string;
    private attachment: any;
    constructor(receiver: string | string[]) {
        this.name = process.env.PLATFORM_NAME as string;
        const accessToken = Oauth2_client.getAccessToken();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken: accessToken as unknown as string,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.receiver = receiver;
    }

    public verificationEmail({ token, name, userId, type }: VerificationEmailTypes) {
        const url = `${FRONTEND_URL[type]}/verification/${userId}/${token}`;
        this._emailTemplate = emailVerificationTemplate(name, url);
        return this._send;
    }

    public passwordResetEmail({ resetToken, name, userId, type }: PasswordResetEmailTypes) {
        const url = `${FRONTEND_URL[type]}/reset-password/${userId}/${resetToken}`;

        this._emailTemplate = resetPasswordTemplate(name, url);
        return this._send;
    }

    public passwordChangedEmail({ name }: PasswordChangedEmailTypes) {
        this._emailTemplate = emailPasswordChanged(name);
        return this._send;
    }

    _send = {
        send: async () => {
            if (!this._emailTemplate) {
                throw new Error('messages:error.Email template is not defined');
            }
            let mailOptions = {
                from: `"${this.name}" <${process.env.GMAIL_USER}>`,
                to: this.receiver,
                subject: this._emailTemplate.subject,
                html: this._emailTemplate.content,
                attachments: this.attachment ? this.attachment : [],
            };
            try {
                const response = await this.transporter.sendMail(mailOptions);

                if (response.rejected.length > 0) {
                    return Promise.resolve({
                        success: false,
                        message: response.rejected.join(', ') + ' Email sending failed',
                    });
                }
            } catch (error) {
                return Promise.resolve({
                    success: false,
                    message: error,
                });
            }
            return Promise.resolve({
                success: true,
                message: 'Email sent',
            });
        },
    };
}

export default EmailSender;
