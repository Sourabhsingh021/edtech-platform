
const resetPasswordEmail = (firstName, resetURL) => {
  const safeFirstName = String(firstName || "there")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // Escape the URL before inserting it into HTML.
  const safeResetURL = String(resetURL)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password | SkillBridge</title>
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
                  <td style="padding:32px 28px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">
                      Reset your password
                    </h2>

                    <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.8;">
                      Hi ${safeFirstName},
                    </p>

                    <p style="margin:0 0 22px;color:#4b5563;font-size:15px;line-height:1.8;">
                      We received a request to reset the password for your
                      SkillBridge account. Click the button below to choose
                      a new password.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                      align="center" style="margin:0 auto 24px;">
                      <tr>
                        <td align="center" bgcolor="#4f46e5" style="border-radius:8px;">
                          <a href="${safeResetURL}" target="_blank"
                            style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;border-radius:8px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 12px;color:#4b5563;font-size:14px;line-height:1.8;">
                      This link expires in <strong>5 minutes</strong> and can
                      be used only once.
                    </p>

                    <p style="margin:0 0 12px;color:#6b7280;font-size:13px;line-height:1.8;">
                      If the button doesn't work, copy and paste this URL
                      into your browser:
                    </p>

                    <p style="margin:0 0 22px;overflow-wrap:anywhere;font-size:13px;line-height:1.8;">
                      <a href="${safeResetURL}" style="color:#4f46e5;word-break:break-all;">
                        ${safeResetURL}
                      </a>
                    </p>

                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.8;">
                      If you didn't request a password reset, you can ignore
                      this email. Your password won't change unless the link
                      is used.
                    </p>
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

export default resetPasswordEmail;
