//? PAGE CON SENDING EMAIL

// require('dotenv').config(); // Carica le variabili d'ambiente dal file .env
// const express = require('express');
// const bodyParser = require('body-parser');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const app = express();
// const port = 3001;

// console.log('EMAIL_USER:', process.env.EMAIL_USER); // Log per verificare le variabili d'ambiente
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS); // Log per verificare le variabili d'ambiente

// app.use(bodyParser.json());
// app.use(cors());

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER, // Usa la variabile d'ambiente
//     pass: process.env.EMAIL_PASS,  // Usa la variabile d'ambiente
//   }
// });

// app.post('/login', (req, res) => {
//   const { email, phoneNumber } = req.body;
//   const loginTime = new Date().toLocaleString();

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: ['simo.bara12@gmail.com', email], // Invia sia al tuo indirizzo che all'indirizzo dell'utente
//     subject: 'Nuovo login',
//     text: `Numero di cellulare: ${phoneNumber}\nEmail: ${email}\nOra di accesso: ${loginTime}`
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Errore durante l\'invio della mail:', error);
//       return res.status(500).json({ success: false, message: error.message });
//     }
//     res.json({ success: true, message: 'Credenziali inviate con successo' });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
