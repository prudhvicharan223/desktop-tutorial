const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Phone number to send OTP to
 * @param {string} otp - OTP code to send
 * @returns {Promise}
 */
exports.sendOTP = async (phoneNumber, otp) => {
  try {
    // For development, log OTP instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      return { success: true, message: 'OTP logged to console (dev mode)' };
    }

    // Send SMS via Twilio in production
    const message = await client.messages.create({
      body: `Your WhatsApp Clone verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};
