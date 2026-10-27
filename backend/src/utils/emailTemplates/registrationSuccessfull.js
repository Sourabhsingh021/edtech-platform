
const registrationSuccessEmail = (firstName, accountType) => {
  const safeFirstName = String(firstName)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const isInstructor = accountType === "instructor";

  const welcomeMessage = isInstructor
    ? "Welcome to SkillBridge! Your instructor account has been created successfully. We're excited to have you join our teaching community."
    : "Welcome to SkillBridge! Your account has been created successfully. We're excited to be part of your learning journey.";

  const journeyMessage = isInstructor
    ? "Share your knowledge, create engaging courses, and help learners develop new skills. Your expertise can make a real difference."
    : "Explore courses, learn new skills, and take the next step toward your goals. Your learning journey starts here!";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to SkillBridge</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
      ">
        <table role="presentation" width="100%" cellpadding="0"
          cellspacing="0" border="0"
          style="background-color:#f3f4f6;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0"
                cellspacing="0" border="0"
                style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">

                <tr>
                  <td align="center" style="background:#4f46e5;padding:30px 20px;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">
                      SkillBridge
                    </h1>
                    <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">
                      Learn. Build. Grow.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:35px 28px 15px;">
                    <div style="
                      width:64px;
                      height:64px;
                      line-height:64px;
                      border-radius:50%;
                      background:#dcfce7;
                      color:#15803d;
                      font-size:34px;
                      font-weight:bold;">
                      &#10003;
                    </div>

                    <h2 style="
                      margin:22px 0 12px;
                      color:#111827;
                      font-size:25px;">
                      Welcome to SkillBridge, ${safeFirstName}!
                    </h2>

                    <p style="
                      margin:0;
                      color:#4b5563;
                      font-size:15px;
                      line-height:1.8;">
                      ${welcomeMessage}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:15px 28px 30px;">
                    <p style="
                      margin:0 0 18px;
                      color:#4b5563;
                      font-size:15px;
                      line-height:1.8;">
                      ${journeyMessage}
                    </p>

                    <p style="
                      margin:0;
                      color:#4b5563;
                      font-size:15px;
                      line-height:1.8;">
                      We're glad you're here. Let's learn, grow, and
                      achieve great things together!
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="
                    padding:22px 20px;
                    background:#f9fafb;
                    border-top:1px solid #e5e7eb;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                      Thank you for joining SkillBridge!
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      &copy; ${new Date().getFullYear()} SkillBridge.
                      All rights reserved.
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

export default registrationSuccessEmail;
