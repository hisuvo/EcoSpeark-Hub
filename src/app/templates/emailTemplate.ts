export const generateEmailTemplate = ({
  templateName,
  appName,
  userName,
  otp,
  expierMinutes,
}: {
  templateName: string;
  appName: string;
  userName: string;
  otp: string;
  expierMinutes: number;
}) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${templateName}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5e6f7;font-family:Arial,sans-serif;">
      
      <div style="max-width:600px;margin:40px auto;background:#dff9cb;border-radius:10px;padding:40px 30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);text-align:center;">
        
        <div style="font-size:22px;font-weight:bold;color:#2563eb;margin-bottom:20px;">
          ${appName}
        </div>

        <h2 style="color:#111827;margin-bottom:10px;">Email Verification</h2>

        <p style="color:#6b7280;font-size:15px;margin-bottom:25px;">
          Hello <strong>${userName}</strong>, <br />
          Use the following OTP to verify your email address.
        </p>

        <div style="display:inline-block;padding:15px 30px;font-size:28px;font-weight:bold;letter-spacing:8px;color:#ffffff;background:#62aafd;border-radius:8px;margin-bottom:25px;">
          ${otp}
        </div>

        <p style="color:#6b7280;font-size:15px;margin-bottom:25px;">
          This OTP is valid for <strong>${expierMinutes} minutes</strong>.
        </p>

        <div style="font-size:13px;color:#ef4444;margin-top:15px;">
          Do not share this code with anyone.
        </div>

        <div style="margin-top:30px;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>

      </div>

    </body>
  </html>
  `;
};
