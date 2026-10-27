
const passwordResetSuccessEmail = (firstName) => {
  const safeFirstName = String(firstName || "there")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Changed | SkillBridge</title>
      </head>

      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#f3f4f6;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">

                <tr>
                  <td align="center" style="background:#4f46e5;padding:30px 20px;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">SkillBridge</h1>
                    <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">
                      Learn. Build. Grow.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:35px 28px 15px;">
                    <div style="width:64px;height:64px;line-height:64px;border-radius:50%;background:#dcfce7;color:#15803d;font-size:34px;font-weight:bold;">
                      &#10003;
                    </div>

                    <h2 style="margin:22px 0 12px;color:#111827;font-size:25px;">
                      Password Changed Successfully!
                    </h2>

                    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.8;">
                      Hi ${safeFirstName},
                    </p>

                    <p style="margin:12px 0 0;color:#4b5563;font-size:15px;line-height:1.8;">
                      Your SkillBridge account password has been successfully
                      updated. You can now log in using your new password.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 28px 30px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background:#fff7ed;border-radius:8px;">
                      <tr>
                        <td style="padding:18px;">
                          <p style="margin:0 0 8px;color:#9a3412;font-size:14px;font-weight:bold;">
                            Security notice
                          </p>
                          <p style="margin:0;color:#9a3412;font-size:14px;line-height:1.8;">
                            If you didn't make this change, your account
                            may be at risk. Please reset your password again
                            and contact support if you need assistance.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:22px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                      Your security matters to us.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      &copy; ${new Date().getFullYear()} SkillBridge. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default passwordResetSuccessEmail;
