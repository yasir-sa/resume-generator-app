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
    if (req.cookies.token) {
      return res.redirect("http://localhost:5000/login");
    }
  
  
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




















exports.checkAuth =(req,res)=>{
  const token =req.cookies.token;
  if(!token){
    return res.status(401).json({
      success:false,
      message:"Token not found "
    })
  }
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    return res.status(200).json({
      success:true,
      user:{
        id:decoded.id,
        email:decoded.email
      }
    })
  }
  catch(error){
    return res.status(401).json({
      success:false,
      message:"Invalid or expired token"
    })
  }
}











exports.logout =(req,res)=>{
  res.clearCookie("token",{
    httpOnly:true,
    sameSite:"lax",
    secure:false
  });
  return res.status(200).json({
      success: true,
    message: "Logout successful"
  })
}













// exports.googlelogin =  async (req,res) =>{
//  try{
//       if(req.cookies.token){
//       return res.redirect("http://localhost:5000/login")
//     }

      
//       const profile= req.user
      
//       const email = profile.emails?.[0]?.value;
//       const name =profile.displayName;
//       const googleid = profile.id;
//       const photosrc=profile.photos?.[0]?.value
//       console.log("yasir  this profile data :",email,name,googleid,photosrc)
 
//        const userquery =await pool.query(
//           "SELECT * FROM registertable WHERE email = $1",
//       [email]
//        )
//        if(userquery.rows.length>0){
//         await pool.query(
//            `UPDATE registertable
//          SET name=$1, google_id=$2, picture=$3, provider='google'
//          WHERE email=$4`,
//         [name, googleid, photosrc, email]
        
//       )
//       console.log("Existing user updated ✅");
//        }
//        else {
//       // 5️⃣ Email does NOT exist → insert new row
//       await pool.query(
//         `INSERT INTO registertable (name, email, provider, google_id, picture)
//          VALUES ($1, $2, 'google', $3, $4)`,
//         [name, email, googleid, photosrc]
//       );
//       console.log("New Google user inserted ✅");
//     }

//     // 6️⃣ Redirect user to register page (or wherever you want)
//     return res.redirect("http://localhost:5000/product");
 
//     }
//  catch(error){
//   console.error("google login Error:",error)
//   return res.status(500).send("Server Error");
//  }

  
    

  
   




  
// }




exports.googlelogin = async (req, res) => {
  try {
    // 1️⃣ Check if user already has a token cookie
    if (req.cookies.token) {
      return res.redirect("http://localhost:5000/login");
    }
    let user;
    // 2️⃣ Get Google profile
    const profile = req.user;

    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const googleid = profile.id;
    const photosrc = profile.photos?.[0]?.value;

    console.log("yasir this profile data:", email, name, googleid, photosrc);

    // 3️⃣ Check if email already exists in registertable
    const userQuery = await pool.query(
      "SELECT * FROM registertable WHERE email = $1",
      [email]
    );

    if (userQuery.rows.length > 0) {
      // 4️⃣ Existing user → update Google info + verification=true + provider='google'
      const ubdateResult =await pool.query(
        `UPDATE registertable
         SET name=$1, google_id=$2, picture=$3, provider='google', verification=true,
             password=COALESCE(password, '')   -- keep existing password or empty if null
         WHERE email=$4
         RETURNING *`,
        [name, googleid, photosrc, email]
      );
        user = ubdateResult.rows[0];
      
      console.log("Existing Google user updated ✅ (provider=google, verification=true)");
    } else {
      // 5️⃣ New user → insert row with dummy password, verification=true, provider='google'
      const insertResult = await pool.query(
        `INSERT INTO registertable 
         (name, email, password, provider, google_id, picture, verification)
         VALUES ($1, $2, '', 'google', $3, $4, true)
         RETURNING *`,
        [name, email, googleid, photosrc]
      );
      user=insertResult.rows[0]
      console.log("New Google user inserted ✅ (provider=google, verification=true)");
    
    
    }
       

    const token = jwt.sign(
      {
        id:user.id,
        email:user.email,
        provider:user.provider,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:process.env.JWT_EXPIRE,
      }
    )


    res.cookie("token",token,{
      httpOnly: true,
      secure: false,
      sameSite: "lax",
       maxAge: 24 * 60 * 60 * 1000,
    });






    // 6️⃣ Redirect user after Google login
    return res.redirect("http://localhost:5000/product");

  } catch (error) {
    console.error("Google login Error:", error);
    return res.status(500).send("Server Error");
  }
};







exports.getUserProfile = async (req, res) => {
  console.log("🔥 getUserProfile HIT");
  console.log("USER FROM JWT:", req.user);

  // JWT id-ஐ பயன்படுத்தி DB-ல fetch பண்ண
  const result = await pool.query(
    "SELECT id, name, email, picture FROM registertable WHERE id = $1",
    [req.user.id]  // ⚠️ இது id JWT-ல் இருந்தது (profile.id) → உங்கள் problem
  );

  if(result.rows.length === 0){
    return res.status(404).json({ success:false, message:"User not found" });
  }

  const user = result.rows[0];
  console.log("DB USER:", user);

  res.json({
    success: true,
    userId: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture
  });
};
