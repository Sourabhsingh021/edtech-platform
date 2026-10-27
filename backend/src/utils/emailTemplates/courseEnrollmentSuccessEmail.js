const courseEnrollmentSuccessEmail = ({
  firstName,
  courseName,
  instructorName,
  courseURL,
}) => {
  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const safeFirstName = escapeHTML(firstName || "Learner");
  const safeCourseName = escapeHTML(courseName || "Your new course");
  const safeInstructorName = escapeHTML(
    instructorName || "Your instructor"
  );

  // Only allow trusted HTTPS course URLs.
  let safeCourseURL = "";

  try {
    const parsedURL = new URL(courseURL);

    if (parsedURL.protocol === "https:") {
      safeCourseURL = escapeHTML(parsedURL.href);
    }
  } catch {
    // Omit the button if the course URL is invalid.
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Course Enrollment Successful | SkillBridge</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background-color:#f3f4f6;
        font-family:Arial,Helvetica,sans-serif;
        color:#1f2937;
      ">
        <table role="presentation" width="100%" cellpadding="0"
          cellspacing="0" border="0"
          style="background-color:#f3f4f6;padding:32px 12px;">
          <tr>
            <td align="center">

              <table role="presentation" width="100%" cellpadding="0"
                cellspacing="0" border="0"
                style="
                  max-width:580px;
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                ">

                <!-- Header -->
                <tr>
                  <td align="center" style="
                    background:#4f46e5;
                    padding:28px 20px;
                  ">
                    <h1 style="
                      margin:0;
                      color:#ffffff;
                      font-size:28px;
                    ">
                      SkillBridge
                    </h1>

                    <p style="
                      margin:8px 0 0;
                      color:#e0e7ff;
                      font-size:14px;
                    ">
                      Learn. Build. Grow.
                    </p>
                  </td>
                </tr>

                <!-- Success message -->
                <tr>
                  <td align="center" style="padding:32px 28px 12px;">
                    <div style="
                      width:60px;
                      height:60px;
                      line-height:60px;
                      border-radius:50%;
                      background:#dcfce7;
                      color:#15803d;
                      font-size:32px;
                      font-weight:bold;
                    ">
                      &#10003;
                    </div>

                    <h2 style="
                      margin:20px 0 10px;
                      color:#111827;
                      font-size:25px;
                    ">
                      You're officially enrolled!
                    </h2>

                    <p style="
                      margin:0;
                      color:#4b5563;
                      font-size:15px;
                      line-height:1.8;
                    ">
                      Hi ${safeFirstName}, congratulations!
                      Your enrollment is confirmed. Your next learning
                      adventure starts now.
                    </p>
                  </td>
                </tr>

                <!-- Course details -->
                <tr>
                  <td style="padding:20px 28px;">
                    <table role="presentation" width="100%"
                      cellpadding="0" cellspacing="0" border="0"
                      style="
                        background:#eef2ff;
                        border:1px solid #e0e7ff;
                        border-radius:10px;
                      ">
                      <tr>
                        <td style="padding:22px;">
                          <p style="
                            margin:0 0 8px;
                            color:#6366f1;
                            font-size:12px;
                            font-weight:bold;
                            letter-spacing:1.5px;
                            text-transform:uppercase;
                          ">
                            YOUR NEW COURSE
                          </p>

                          <h3 style="
                            margin:0 0 18px;
                            color:#312e81;
                            font-size:21px;
                            line-height:1.5;
                          ">
                            ${safeCourseName}
                          </h3>

                          <p style="
                            margin:0;
                            color:#4b5563;
                            font-size:14px;
                            line-height:1.8;
                          ">
                            <strong>Instructor:</strong>
                            ${safeInstructorName}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Call to action -->
                <tr>
                  <td align="center" style="padding:4px 28px 28px;">
                    <p style="
                      margin:0 0 22px;
                      color:#4b5563;
                      font-size:15px;
                      line-height:1.8;
                    ">
                      Every expert starts somewhere. Take the first step,
                      explore your course, and keep building your skills
                      one lesson at a time.
                    </p>

                    ${
                      safeCourseURL
                        ? `
                          <table role="presentation" cellpadding="0"
                            cellspacing="0" border="0">
                            <tr>
                              <td align="center" bgcolor="#4f46e5"
                                style="border-radius:8px;">
                                <a href="${safeCourseURL}"
                                  style="
                                    display:inline-block;
                                    padding:14px 30px;
                                    color:#ffffff;
                                    text-decoration:none;
                                    font-size:15px;
                                    font-weight:bold;
                                    border-radius:8px;
                                  ">
                                  Start Learning
                                </a>
                              </td>
                            </tr>
                          </table>
                        `
                        : ""
                    }

                    <p style="
                      margin:22px 0 0;
                      color:#6b7280;
                      font-size:13px;
                      line-height:1.8;
                    ">
                      You can access your enrolled course anytime
                      from your SkillBridge learning dashboard.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="
                    padding:22px 20px;
                    background:#f9fafb;
                    border-top:1px solid #e5e7eb;
                  ">
                    <p style="
                      margin:0 0 8px;
                      color:#6b7280;
                      font-size:13px;
                    ">
                      Happy learning! We're rooting for you.
                    </p>

                    <p style="
                      margin:0;
                      color:#9ca3af;
                      font-size:12px;
                    ">
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

export default courseEnrollmentSuccessEmail;
