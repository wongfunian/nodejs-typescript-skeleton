import { emailSignature } from './emailSignature';

const resetPassword = (userName: string, url: string) => {
    let subject = `Secure your RT account: RT your password`;
    let htmlTemplate = `
        <div>Dear ${userName},</div>
        <br />

        <div>You have requested to reset your password. If you did not request this please login and change the password.</div>
        <br />
        <div style="text-align: left">
            <a href="${url}">
                ${url}
            </a>
        </div>
        <br />
        <p style="font-style: italic; font-size: 14px;">If this wasn’t you: Safely ignore this email but remember to keep your password secure and do not share it with anyone.</p>
        <br />

        ${emailSignature}
    `;

    return {
        subject,
        content: htmlTemplate,
    };
};

export default resetPassword;
