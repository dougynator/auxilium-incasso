import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, email not sent:', options);
    return;
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];
  const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;

  // Use test domain in development, verified domain in production
  const fromEmail = process.env.NODE_ENV === 'production' && process.env.RESEND_VERIFIED_DOMAIN
    ? `Auxilium Incasso <noreply@${process.env.RESEND_VERIFIED_DOMAIN}>`
    : process.env.RESEND_FROM_EMAIL || 'Auxilium Incasso <onboarding@resend.dev>';

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      cc,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        content_type: att.contentType,
      })),
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}


