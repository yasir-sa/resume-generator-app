const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
},


});

const sendOTPEmail =(to, otp)=>{
     const mailOption ={
        from: process.env.EMAIL_USER,
        to,
        subject:"Your OTP for resume Builder",
        text:`Your OTP is ${otp}.It will expire in 1 minute .`,
     }
      return transporter.sendMail(mailOption);
}

module.exports = sendOTPEmail;