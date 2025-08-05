export const sendMail = async (from, companyName, to, subject, htmlBody) => {
  const apiKey = 're_7F4YBhvg_7uXoBfPpE6N1U6niYGGCY3LN';
  const apiUrl = 'https://api.resend.com/emails';
//  const  proxyUrl = 'https://cors-anywhere.herokuapp.com/';



  const emailData = {
    from: from,
    companyName: companyName,
    to: to,
    subject: subject,
    html: htmlBody,
  };

  try {
    const response = await fetch(apiUrl , {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("✅ Email sent successfully:", data);
    } else {
      console.error("❌ Failed to send email:", data);
    }
  } catch (error) {
    console.error("⚠️ Exception while sending email:", error);
  }
};

