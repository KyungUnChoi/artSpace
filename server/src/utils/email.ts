import nodemailer from 'nodemailer';

interface BookingEmailData {
  spaceName: string;
  date: string;
  hours: number[];
  requesterName: string;
  requesterEmail: string;
  message: string;
}

export async function sendBookingRequestEmail(to: string, data: BookingEmailData): Promise<void> {
  if (!process.env.SMTP_HOST) return; // skip if SMTP not configured

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  });

  const sorted = [...data.hours].sort((a, b) => a - b);
  const startStr = `${String(sorted[0]).padStart(2, '0')}:00`;
  const endStr = `${String(sorted[sorted.length - 1] + 1).padStart(2, '0')}:00`;
  const timeRange = `${startStr} – ${endStr} (${data.hours.length}hr${data.hours.length > 1 ? 's' : ''})`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@artspace.kr',
    to,
    replyTo: data.requesterEmail,
    subject: `[ArtSpace] Booking Request — ${data.spaceName}`,
    text: [
      `Booking Request`,
      ``,
      `Space:  ${data.spaceName}`,
      `Date:   ${data.date}`,
      `Time:   ${timeRange}`,
      ``,
      `From:   ${data.requesterName}`,
      `Email:  ${data.requesterEmail}`,
      ``,
      `Message:`,
      data.message || '(none)',
    ].join('\n'),
    html: `
      <h2 style="margin:0 0 16px;font-family:sans-serif;">Booking Request</h2>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Space</td><td style="padding:4px 0;font-weight:600;">${data.spaceName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Date</td><td style="padding:4px 0;">${data.date}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Time</td><td style="padding:4px 0;">${timeRange}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">From</td><td style="padding:4px 0;">${data.requesterName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">Email</td><td style="padding:4px 0;"><a href="mailto:${data.requesterEmail}">${data.requesterEmail}</a></td></tr>
      </table>
      ${data.message ? `<p style="font-family:sans-serif;font-size:14px;margin-top:16px;"><strong>Message:</strong><br>${data.message}</p>` : ''}
    `,
  });
}
