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
    console.error('❌ RESEND_API_KEY not set, email not sent');
    console.error('❌ Email details:', {
      to: options.to,
      subject: options.subject,
      hasAttachments: !!options.attachments?.length,
    });
    throw new Error('RESEND_API_KEY is not configured. Please set it in environment variables.');
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];
  const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;

  // Use test domain in development, verified domain in production
  const fromEmail = process.env.NODE_ENV === 'production' && process.env.RESEND_VERIFIED_DOMAIN
    ? `Auxilium Incasso <noreply@${process.env.RESEND_VERIFIED_DOMAIN}>`
    : process.env.RESEND_FROM_EMAIL || 'Auxilium Incasso <onboarding@resend.dev>';

  console.log('📧 Sending email:', {
    from: fromEmail,
    to,
    cc,
    subject: options.subject,
    attachmentsCount: options.attachments?.length || 0,
  });

  try {
    const result = await resend.emails.send({
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
    
    console.log('✅ Email sent successfully:', {
      id: result.data?.id,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      subject: options.subject,
      hasAttachments: !!options.attachments?.length,
    });
    
    // Log any errors from Resend response
    if (result.error) {
      console.error('⚠️ Resend returned an error:', result.error);
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Failed to send email:', {
      error: error.message,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      subject: options.subject,
      hasAttachments: !!options.attachments?.length,
      response: error.response?.data || error.response,
      status: error.status,
      details: error.details || error,
      stack: error.stack,
    });
    throw error;
  }
}


