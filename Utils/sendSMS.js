const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log('📤 SMS sent:', message.sid);
  } catch (err) {
    console.error('❌ Failed to send SMS:', err.message);
  }
};

module.exports = sendSMS;
