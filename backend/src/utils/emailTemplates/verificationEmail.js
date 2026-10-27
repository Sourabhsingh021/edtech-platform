const verificationEmail = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="padding:30px 10px;background:#f3f4f6;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">

                <tr>
                  <td align="center" style="background:#4f46e5;padding:28px;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                      SkillBridge
                    </h1>
                    <p style="margin:8px 0 0;color:#e0e7ff;">
                      Learn. Build. Grow.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px;">
                    <h2 style="margin-top:0;color:#111827;">
                      Verify your email address
                    </h2>

                    <p style="color:#4b5563;line-height:1.7;">
                      Welcome to SkillBridge! Use the verification code
                      below to complete your registration.
                    </p>

                    <table width="100%" role="presentation"
                      cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="
                          padding:24px 10px;
                          background:#eef2ff;
                          border:1px dashed #818cf8;
                          border-radius:8px;">
                          <p style="margin:0 0 10px;color:#6366f1;">
                            YOUR VERIFICATION CODE
                          </p>
                          <p style="
                            margin:0;
                            color:#3730a3;
                            font-size:32px;
                            font-weight:bold;
                            letter-spacing:8px;">
                            ${otp}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#4b5563;line-height:1.7;margin-top:22px;">
                      This code expires in <strong>5 minutes</strong>.
                      Never share it with anyone.
                    </p>

                    <p style="color:#6b7280;font-size:14px;line-height:1.7;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="
                    padding:20px;
                    background:#f9fafb;
                    border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                      Thank you for choosing SkillBridge.
                    </p>
                    <p style="color:#9ca3af;font-size:12px;">
                      &copy; ${new Date().getFullYear()} SkillBridge
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

export default verificationEmail;