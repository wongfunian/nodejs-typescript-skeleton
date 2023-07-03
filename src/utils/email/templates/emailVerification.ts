import { emailSignature } from './emailSignature';

const emailVerification = (userName: string, url: string) => {
    let subject = `You are invited to verify your RTM account`;
    let htmlTemplate = `
        <body style="font-family: tahoma; font-size: 13px; line-height: 20px; background-color: #f5f5f5; padding: 50px;">
  <div style="margin: 0 auto; max-width: 500px; padding: 20px; background-color: white;">
    <hr />
    <div>Dear ${userName},</div>
    <br/>
    <div>We just need to verify your email address before you can access
      <span style="font-weight: bold">Propagate Intellectual Property System</span>, click the button below to verify and set your own password.
    </div>
    <br/>
    <div>
      <a href="${url}" style="cursor: pointer">
        <button style="width: 100%; padding: 10px 0; font-size: 15px; background-color: #d8a382; outline: none; border: none; color: white; cursor: pointer">Set Password</button>
      </a>
    </div>
    <br/>
    <p>*Please take action to verify your RTM account within 3 days before the verification expires. Do notify us if you fail to verify your account.</p>
    <p>Thank you!</p>
    <br/>
    <p style="font-style: italic; font-size: 12px;">You received this email because you are invited to verify your account. If this was sent to you by mistake, please contact support.</p>
    <br/>
  </div>
</body>
    `;

    return {
        subject,
        content: htmlTemplate,
    };
};

export default emailVerification;
