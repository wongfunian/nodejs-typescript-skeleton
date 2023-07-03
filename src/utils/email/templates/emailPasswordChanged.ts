import { emailSignature } from './emailSignature';

const passwordChanged = (userName: string) => {
    let subject = `Your RT account password was changed`;
    let htmlTemplate = `
        <div>Dear ${userName},</div>
        <br />

        <div>You’ve successfully updated your password! If you did nor make this change, contact our support team.</div>
        <br />
        <div>If this was you and you’re struggling to log in: Click the link below to reset your RT account password.</div>
        <br />
        <p style="font-style: italic; font-size: 14px;">You are receiving this email because you have completely changed your RT account password. If this wasn’t you: Safely ignore this email but remember to keep your password secure and do not share it with anyone.</p>
        <br />

        ${emailSignature}
    `;

    return {
        subject,
        content: htmlTemplate,
    };
};

export default passwordChanged;
