const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 

const sendOTPEmail =require("../utils/email");



const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

exports.registerUser = async (req,res)=>{
  const {name,email,password}= req.body;
if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  try {

        await pool.query(`
      DELETE FROM registertable
      WHERE verification = false
      AND otp_expiry < NOW()
    `);


     const userCheck = await pool.query(
  "SELECT * FROM registertable WHERE email=$1 AND verification = true",
  [email]
);

if (userCheck.rows.length > 0) {
  return res.status(400).json({ message: "Email already this registered" });
}

     const hashedPassword = await bcrypt.hash(password, 10);
   const otp =generateOTP()
   const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute
   
  
   const newUser = await pool.query(
      `INSERT INTO registertable (name, email, password, otpnumber, otp_expiry) 
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, email, hashedPassword, otp, otpExpiry]
    );

     await sendOTPEmail(email, otp);
       res.status(200).json({ message: "User registered. OTP sent to email", user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}









exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, otpnumber, otp_expiry, verification
       FROM registertable
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Already verified
    if (user.verification === true) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // 🔥 OTP type safe check
    if (Number(user.otpnumber) !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔥 OTP expiry safe check
    const now = new Date();
    const expiryTime = new Date(user.otp_expiry);

    if (now.getTime() > expiryTime.getTime()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ Update verification
    await pool.query(
      `UPDATE registertable
       SET verification = true,
           otpnumber = NULL,
           otp_expiry = NULL
       WHERE email = $1 AND verification = false`,
      [email]
    );

    res.status(200).json({ message: "Registration successfully ✅" });

  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};











exports.userlogin = async(req,res)=>{
   const{email,password}=req.body

   
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }




      try{
        const result =await pool.query(
           `SELECT id, name, email, password, verification
       FROM registertable
       WHERE email = $1`,
       [email]
        )
        if (result.rows.length===0){
          return res.status(400).json({ message: "Invalid email or password" });
        }
        

       const user=result.rows[0];

       if(user.verification === false ){
        return res.status(403).json({
          message:"please verify your email before login "
        })
       }

       const ismatch = await bcrypt.compare(password,user.password);


       if(!ismatch){
        return res.status(400).json({message:"invalid   password"})

       }


       const token =jwt.sign(
        {id:user.id,email:user.email},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRE}
       )

       res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        sameSite:"lax",
        maxAge:24 * 60 * 60 * 1000
       });


      res.status(200).json({
  success: true,
  message: "Login successful",
  user: {
    id: user.id,
    name: user.name,
    email: user.email
  }
});



      }
      catch(error){
        console.log("login:",error)
        res.status(500).json({message:"Server error"})
      }
}
