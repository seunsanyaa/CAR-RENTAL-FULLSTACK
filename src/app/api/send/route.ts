import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, token } = body;
    console.log(body);
    const { data, error } = await resend.emails.send({
      from: "admin@carrent.click",
      to: email,
      subject: "Welcome to CarRental",
      html: `
    <h1>Welcome to the Team!</h1>
    <p>Your account has been created successfully with the role of ${role}.</p>
    <p>Thank you for joining us!</p>

    <a href="https://carrent.click/login?token=${token}">Login</a>
  `,
    });

    if (error) {
      console.log(error);
    }
    console.log(data);
  } catch (error) {
    console.log(error);
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
