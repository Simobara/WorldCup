module.exports = (req, res) => {
    const { otp } = req.body;
  
    // Simula la verifica dell'OTP
    if (otp === 'expected-otp') {
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  };
  