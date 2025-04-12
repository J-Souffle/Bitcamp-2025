import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Twilio phone number

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { phoneNumber, message } = req.body;

    try {
      await client.calls.create({
        to: phoneNumber,
        from: twilioPhoneNumber,
        twiml: `<Response><Say>${message}</Say></Response>`, // Text-to-Speech message
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error making call:", error);
      res.status(500).json({ error: "Failed to make the call." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
