//? PAGE CON OTP
// const express = require('express');
// const bodyParser = require('body-parser');
// const twilio = require('twilio');
// const cors = require('cors');

// const app = express();
// const port = 3001;

// app.use(bodyParser.json());
// app.use(cors());

// const accountSid = 'your_twilio_account_sid'; // Trova queste informazioni nella tua dashboard Twilio
// const authToken = 'your_twilio_auth_token';
// const client = twilio(accountSid, authToken);

// let otpStore = {}; // Una semplice memoria per memorizzare OTP temporaneamente

// app.post('/send-otp', (req, res) => {
//   const { phoneNumber } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   otpStore[phoneNumber] = otp;

//   client.messages
//     .create({
//       body: `Your OTP code is ${otp}`,
//       from: 'your_twilio_phone_number',
//       to: phoneNumber,
//     })
//     .then((message) => res.json({ success: true, message: 'OTP sent' }))
//     .catch((error) => res.status(500).json({ success: false, message: error.message }));
// });

// app.post('/verify-otp', (req, res) => {
//   const { phoneNumber, otp } = req.body;
//   if (otpStore[phoneNumber] === otp) {
//     delete otpStore[phoneNumber];
//     res.json({ success: true, message: 'OTP verified' });
//   } else {
//     res.status(400).json({ success: false, message: 'Invalid OTP' });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
