import { Resend } from "resend";
import { NextResponse } from 'next/server';

const resend = new Resend('re_iw52KyAj_B7VbaMofwgtWCR2npdjww1LY');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, token } = body;
    
    if (!email || !role || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Sending email to:', email, 'with role:', role);
    
    const { data, error } = await resend.emails.send({
      from: "admin@carrent.click",
      to: email,
      subject: "Welcome to CarRental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to the Team!</h1>
          <p>Your account has been created successfully with the role of <strong>${role}</strong>.</p>
          <p>Thank you for joining us!</p>
          <div style="margin: 30px 0;">
            <a href="https://final-project-customer-rosy.vercel.app/Login?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Click here to Login
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't request this email, please ignore it.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
// const emailTrigger=  await resend.emails.send({
//   from: 'admin@carrent.click',
//   to: newStaff.email,
//   subject: 'Welcome to Car rental',
//   html: `
//     <h1>Welcome to the Team!</h1>
//     <p>Your account has been created successfully with the role of ${newStaff.role}.</p>
//     <p>Thank you for joining us!</p>
//   `
// });
