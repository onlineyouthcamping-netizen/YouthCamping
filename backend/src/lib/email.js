const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
// Use the API key added to .env
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();


const BRAND_COLOR = '#1e293b';
const ACCENT_COLOR = '#3b82f6';
const LOGO_URL = 'https://youthcamping.com/logo.png'; // Update with real logo URL

const getBaseTemplate = (content, previewText) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouthCamping</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background-color: ${BRAND_COLOR}; padding: 40px 30px; text-align: center; color: #ffffff; }
    .logo { font-size: 26px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
    .content { padding: 40px; line-height: 1.6; color: #334155; }
    .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .button { display: inline-block; padding: 14px 30px; background-color: ${ACCENT_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; }
    .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin: 25px 0; }
    .label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; letter-spacing: 1px; }
    .value { font-size: 14px; font-weight: 700; color: #1e293b; }
    h1 { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 0; letter-spacing: -0.5px; }
    .preview-text { display: none; font-size: 0; color: transparent; height: 0; width: 0; }
    .tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; background: #f1f5f9; color: #64748b; margin-bottom: 15px; }
    .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="preview-text">${previewText}</div>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="YouthCamping" style="height: 50px; width: auto; display: block; margin: 0 auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <div class="logo" style="display: none;">YOUTHCAMPING.</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="font-weight: 900; color: #64748b; margin-bottom: 10px;">YOUTHCAMPING EXPERIENCES</p>
      <p>&copy; ${new Date().getFullYear()} YouthCamping. All rights reserved.</p>
      <p>Address: Delhi, India | Support: info@youthcamping.com</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html, type, bookingId, prisma, attachments }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { "name": "Youth Camping", "email": "parthyouthcamping@gmail.com" };
    sendSmtpEmail.to = [{ "email": to }];
    
    if (attachments && attachments.length > 0) {
      sendSmtpEmail.attachment = attachments; // Array of { content: 'base64', name: 'file.pdf' }
    }

    const info = await emailApi.sendTransacEmail(sendSmtpEmail);

    if (prisma && bookingId) {
      await prisma.bookingEmailLog.create({
        data: {
          bookingId,
          type,
          recipient: to,
          subject,
          status: 'success',
          metadata: { messageId: info.messageId, hasAttachment: !!attachments },
        },
      });
    }

    return info;
  } catch (error) {
    console.error('❌ SMTP ERROR:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    if (prisma && bookingId) {
      await prisma.bookingEmailLog.create({
        data: {
          bookingId,
          type,
          recipient: to,
          subject,
          status: 'failed',
          error: error.message,
        },
      });
    }
    throw error;
  }
};

const templates = {
  confirmation: (booking) => {
    const trip = booking.tripRef || {};
    const departureDate = booking.departureDate 
      ? new Date(booking.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'To be updated';

    const content = `
      <div style="text-align: left;">
        <p>Dear ${booking.fullName || booking.name},</p>
        <p>Thank you for booking with YouthCamping ❤️</p>
        <p>We are pleased to confirm your booking for <strong>${trip.title || booking.tripName || 'your upcoming trip'}</strong>.</p>
        <p>Your Booking ID is: <strong>${booking.bookingId}</strong><br>
        Please use this ID for future communication and references.</p>

        <div class="highlight-box" style="background-color: #f8fafc;">
          <h2 style="font-size: 16px; margin-top: 0;">🏔️ Trip Details</h2>
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            <div>
              <div class="label">Trip Name</div>
              <div class="value">${trip.title || booking.tripName || 'N/A'}</div>
            </div>
            <div style="display: flex; gap: 40px;">
              <div>
                <div class="label">📍 Departure</div>
                <div class="value">${trip.departureCity || booking.boardingCity || 'N/A'}</div>
              </div>
              <div>
                <div class="label">📅 Departure Date</div>
                <div class="value">${departureDate}</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style="font-size: 16px;">✨ Trip Highlights</h2>
        <ul style="padding-left: 20px; color: #475569; font-size: 14px;">
          ${Array.isArray(trip.highlights) && trip.highlights.length > 0 
            ? trip.highlights.map(h => `<li>${h}</li>`).join('')
            : `
            <li>Highlight 1</li>
            <li>Highlight 2</li>
            <li>Highlight 3</li>
            <li>Highlight 4</li>
            `
          }
          <li>Campfire & Music Night 🔥</li>
          <li>Adventure Activities 🚵</li>
        </ul>

        <div class="divider"></div>

        <h2 style="font-size: 16px;">👤 Contact Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <div class="label">Name</div>
            <div class="value">${booking.fullName || booking.name}</div>
          </div>
          <div>
            <div class="label">Email</div>
            <div class="value">${booking.email || 'N/A'}</div>
          </div>
          <div>
            <div class="label">Phone</div>
            <div class="value">+91 ${booking.mobile || booking.phone || 'N/A'}</div>
          </div>
        </div>

        <div class="divider"></div>

        <h2 style="font-size: 16px;">💰 Pricing Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <th style="text-align: left; padding: 8px 0; color: #64748b;">Description</th>
            <th style="text-align: right; padding: 8px 0; color: #64748b;">Amount</th>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Package Cost</td>
            <td style="text-align: right; padding: 8px 0; font-weight: 600;">₹ ${ (booking.baseAmount || booking.totalAmount).toLocaleString('en-IN') }</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">GST</td>
            <td style="text-align: right; padding: 8px 0; font-weight: 600;">₹ ${ (booking.gstAmount || 0).toLocaleString('en-IN') }</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Discount</td>
            <td style="text-align: right; padding: 8px 0; font-weight: 600; color: #059669;">- ₹ 0</td>
          </tr>
          <tr style="border-top: 2px solid #e2e8f0;">
            <td style="padding: 10px 0; font-weight: 900;">Total</td>
            <td style="text-align: right; padding: 10px 0; font-weight: 900; font-size: 16px;">₹ ${ booking.totalAmount.toLocaleString('en-IN') }</td>
          </tr>
        </table>

        <h2 style="font-size: 16px;">💳 Payment Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Paid Amount</td>
            <td style="text-align: right; padding: 5px 0; font-weight: 700; color: #059669;">₹ ${ booking.advancePaid.toLocaleString('en-IN') }</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Remaining Amount</td>
            <td style="text-align: right; padding: 5px 0; font-weight: 700; color: #dc2626;">₹ ${ booking.remainingAmount.toLocaleString('en-IN') }</td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #f97316; font-weight: 700;">⚠️ Please complete the remaining payment before trip departure.</p>

        <div class="divider"></div>

        <h2 style="font-size: 16px;">📌 Important Notes</h2>
        <ul style="padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.8;">
          <li>Food during travel is not included.</li>
          <li>Separate accommodations for boys & girls.</li>
          <li>Carry valid ID proof during travel.</li>
          <li>Weather & road conditions may affect itinerary.</li>
          <li>Any damage to campsite/hotel property will be chargeable.</li>
        </ul>

        <h2 style="font-size: 16px;">❌ Cancellation Policy</h2>
        <ul style="padding-left: 20px; color: #64748b; font-size: 13px; line-height: 1.8;">
          <li>Before 45 Days – 80% Refund</li>
          <li>Before 30 Days – 50% Refund</li>
          <li>Before 15 Days – 25% Refund</li>
          <li>Within 15 Days – No Refund</li>
        </ul>

        <div class="divider"></div>

        <p style="text-align: center; font-weight: 700;">Thank you for choosing YouthCamping ❤️</p>
        <p style="text-align: center; color: #475569; font-size: 14px;">We look forward to traveling with you and creating unforgettable memories together 🌍✨</p>

        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: 700;">Contact Us</p>
          <p style="margin: 5px 0; font-size: 13px; color: #3b82f6;">📧 youthcampingmedia@gmail.com</p>
          <p style="margin: 5px 0; font-size: 13px; color: #3b82f6;">📞 +91 9924246267</p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.FRONTEND_URL}/my-bookings" class="button">View My Booking</a>
        </div>
      </div>
    `;
    return {
      subject: `Booking Confirmation – ${trip.title || booking.tripName} | Booking ID: ${booking.bookingId}`,
      html: getBaseTemplate(content, `Your booking for ${trip.title || booking.tripName} is confirmed!`),
    };
  },

  payment: (booking, amount) => {
    const content = `
      <h1>Payment Received 💳</h1>
      <p>Hi ${booking.fullName},</p>
      <p>We've successfully received your payment of <strong>₹${amount.toLocaleString()}</strong> for your upcoming trip.</p>
      
      <div class="highlight-box">
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
          <div>
            <div class="label">Transaction Amount</div>
            <div class="value">₹${amount.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Total Paid</div>
            <div class="value">₹${booking.advancePaid.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Remaining Balance</div>
            <div class="value" style="color: #dc2626">₹${booking.remainingAmount.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Payment Status</div>
            <div class="value">${booking.paymentStatus}</div>
          </div>
        </div>
      </div>

      <p>Thank you for keeping your payments on track. It helps us secure the best experiences for you.</p>
    `;
    return {
      subject: `Payment Receipt: ${booking.bookingId} - YouthCamping`,
      html: getBaseTemplate(content, `Payment of ₹${amount} received for booking ${booking.bookingId}`),
    };
  },

  reminder: (booking) => {
    const trip = booking.tripRef || {};
    const content = `
      <h1>Get Ready for Adventure! 🏔️</h1>
      <p>Hi ${booking.fullName},</p>
      <p>Your adventure to <strong>${trip.title || booking.tripName || booking.tripId}</strong> is just around the corner! We wanted to send a quick reminder about your upcoming trip.</p>
      
      <div class="highlight-box">
        <div class="label">Trip Detail</div>
        <div class="value">${trip.title || booking.tripName || booking.tripId}</div>
        <div class="label" style="margin-top: 10px;">Boarding City</div>
        <div class="value">${trip.departureCity || booking.boardingCity || 'To be updated'}</div>
      </div>

      <p>Make sure you have all your essentials ready. Don't forget to check the weather forecast for your destination!</p>
      
      <a href="${process.env.FRONTEND_URL}/packing-list" class="button">View Packing List</a>
    `;
    return {
      subject: `Trip Reminder: Your journey to ${trip.title || booking.tripName || booking.tripId} is coming soon!`,
      html: getBaseTemplate(content, `Are you ready for your trip to ${trip.title || booking.tripName}?`),
    };
  },

  cancellation: (booking) => {
    const trip = booking.tripRef || {};
    const content = `
      <h1>Booking Cancelled</h1>
      <p>Hi ${booking.fullName},</p>
      <p>Your booking for <strong>${trip.title || booking.tripName || booking.tripId}</strong> (ID: ${booking.bookingId}) has been cancelled as requested or due to pending requirements.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; color: #64748b; font-size: 14px;">If this was a mistake, please contact our support team immediately to restore your booking.</p>
      </div>

      <p>We hope to see you on another adventure soon!</p>
    `;
    return {
      subject: `Booking Cancelled: ${booking.bookingId}`,
      html: getBaseTemplate(content, `Your booking ${booking.bookingId} has been cancelled.`),
    };
  },

  invoice: (booking) => {
    const trip = booking.tripRef || {};
    const content = `
      <h1>Your Trip Invoice 📄</h1>
      <p>Hi ${booking.fullName},</p>
      <p>Please find the invoice details for your booking <strong>${booking.bookingId}</strong> below.</p>
      
      <div class="highlight-box">
        <div style="margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
          <div class="label">Trip Name</div>
          <div class="value">${trip.title || booking.tripName || booking.tripId}</div>
        </div>
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
          <div>
            <div class="label">Total Amount</div>
            <div class="value">₹${booking.totalAmount.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Advance Paid</div>
            <div class="value">₹${booking.advancePaid.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Balance Due</div>
            <div class="value" style="color: #dc2626">₹${booking.remainingAmount.toLocaleString()}</div>
          </div>
          <div>
            <div class="label">Payment Status</div>
            <div class="value">${booking.paymentStatus}</div>
          </div>
        </div>
      </div>

      <p>We have attached the official PDF invoice to this email for your records.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/my-bookings" class="button">View My Booking</a>
      </div>
    `;
    return {
      subject: `Invoice for Booking ${booking.bookingId} - YouthCamping`,
      html: getBaseTemplate(content, `Invoice for your trip ${trip.title || booking.tripName}`),
    };
  }
};

module.exports = {
  sendEmail,
  templates
};
