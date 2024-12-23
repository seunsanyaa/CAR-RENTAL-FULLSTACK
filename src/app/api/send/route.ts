import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    <a href="http://localhost:3001/Login?email=${email}&token=${token}">Login</a>
  `,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
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
