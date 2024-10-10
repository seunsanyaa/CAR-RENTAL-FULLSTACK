import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();

    const email = await resend.emails.send({
      from: 'Your Company <no-reply@yourdomain.com>',
      to,
      subject,
      text,
      html,
    });

    return NextResponse.json({ message: 'Email sent successfully!', email });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}