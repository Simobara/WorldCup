// const nodemailer = require('nodemailer');

// module.exports = async (req, res) => {
//   const { phoneNumber, email } = req.body; // Assumendo che l'email sia inclusa nella richiesta

//   // Configura il transporter di Nodemailer
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   // Simula l'invio di un OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email, // L'indirizzo email dell'utente
//     cc: process.env.EMAIL_USER, // Invia una copia a te stesso (opzionale)
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ success: true, message: 'OTP sent successfully', otp });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).json({ success: false, message: 'Error sending OTP' });
//   }
// };