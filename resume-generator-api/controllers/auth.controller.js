const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sendOTPEmail =require("../utils/email");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const multer = require("multer");
require("dotenv").config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
 
// const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const axios = require("axios");











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
  try {
    const result = await pool.query(
      "SELECT id, name, email, picture, provider, password FROM registertable WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    // 🔥 CORE LOGIC
    const needPassword = user.password ===!user.password || user.password.trim() === "";

    res.json({
      success: true,
      userId: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      provider: user.provider,
      needPassword: needPassword   // ✅ MUST
    });

  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};













exports.getTitles= async (req,res)=>{
  try{
       const userId =req.user.id;
    const result = await pool.query(
        `SELECT chattitle_id, title_name
       FROM chattable
       WHERE user_id = $1
       ORDER BY created_time DESC`,
      [userId]
    );
     console.log("Full DB result:", result);
    console.log(" Only rows:", result.rows);
    console.log("Titles only:", result.rows.map(r => r.title_name));
    return res.status(200).json(result.rows);
  }
  catch(error){
    console.error("get titles error:",error)
    return res.status(500).json({
      message: "Server error while fetching titles"
    })
  }
}




































exports.createTitle =async(req,res)=>{
  try{
    const userId = req.user.id;
    const {title_name}= req.body;
      if (!title_name || title_name.trim() === "") {
      return res.status(400).json({
        message: "Title required"
      });
    }
    console.log(title_name)
    const result = await pool.query(
      `INSERT INTO chattable (user_id, title_name)
       VALUES ($1, $2)
       RETURNING chattitle_id, title_name`,
      [userId,title_name]
    );
      
    res.status(201).json({
      message: "Chat title created",
      data: result.rows[0]
    });

  }
  catch(err){
    console.error(" Error creating chat title:", err)
    res.status(500).json({message:"server error"});
  }

}

















exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id; // JWT user id
    const { chattitle_id } = req.params; // URL param

    console.log("User ID 👉", userId);
    console.log("ChatTitle ID 👉", chattitle_id);

    const result = await pool.query(
      `
      SELECT 
        user_question,
        gemini_answer,
        created_time
      FROM chatbot
      WHERE user_id = $1
        AND chattitle_id = $2
      ORDER BY created_time ASC
      `,
      [userId, chattitle_id]
    );

    console.log("📦 Chat rows:", result.rows);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("getChatMessages error:", error);
    return res.status(500).json({
      message: "Server error while fetching chat messages",
    });
  }
};










// exports.sendMessageOld = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { chattitle_id, message } = req.body;

//     // -----------------------
//     // 1️⃣ Fetch old chats
//     // -----------------------
//     const oldChats = await pool.query(
//       `SELECT user_question, gemini_answer
//        FROM chatbot
//        WHERE user_id=$1 AND chattitle_id=$2
//        ORDER BY created_time`,
//       [userId, chattitle_id]
//     );

//     // -----------------------
//     // 2️⃣ Prepare chat context for Gemini
//     // -----------------------
//     const chatContext = [];
//     oldChats.rows.forEach(chat => {
//       chatContext.push({
//         role: "user",
//         parts: [{ text: chat.user_question }]
//       });
//       chatContext.push({
//         role: "model",
//         parts: [{ text: chat.gemini_answer }]
//       });
//     });

//     chatContext.push({
//       role: "user",
//       parts: [{ text: message }]
//     });

//     // -----------------------
//     // 3️⃣ Gemini endpoint URL
//     // -----------------------
//     const GEMINI_MODEL = "gemini-2.5-flash"; // ✅ Check via ListModels
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

//     // -----------------------
//     // 4️⃣ Call Gemini API
//     // -----------------------
//     const geminiResponse = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ contents: chatContext })
//     });

//     if (!geminiResponse.ok) {
//       const text = await geminiResponse.text();
//       console.error("Gemini API failed:", geminiResponse.status, text);
//       return res.status(500).json({ error: "Gemini API failed" });
//     }

//     const result = await geminiResponse.json();
//     console.log("Gemini raw response:", result);

//     // -----------------------
//     // 5️⃣ Extract answer safely
//     // -----------------------
//     const answer =
//       result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
//       if (!answer) console.log("⚠️ Gemini returned empty candidates");

//     console.log("Answer to insert into DB:", answer);

//     // -----------------------
//     // 6️⃣ Insert into DB
//     // -----------------------
//     await pool.query(
//       `INSERT INTO chatbot (user_id, chattitle_id, user_question, gemini_answer)
//        VALUES ($1,$2,$3,$4)`,
//       [userId, chattitle_id, message, answer]
//     );

//     // -----------------------
//     // 7️⃣ Send response to frontend
//     // -----------------------
//     res.json({ answer });

//   } catch (err) {
//     console.error("sendMessage error:", err);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chattitle_id, message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message required" });
    }

    // 1️⃣ Get old messages
    const history = await pool.query(
      `SELECT user_question, gemini_answer
       FROM chatbot
       WHERE user_id=$1 AND chattitle_id=$2
       ORDER BY created_time ASC`,
      [userId, chattitle_id]
    );

    // 2️⃣ Build OpenAI-compatible messages
    const messages = [];

    history.rows.forEach(chat => {
      messages.push({
        role: "user",
        content: chat.user_question
      });
      messages.push({
        role: "assistant",
        content: chat.gemini_answer
      });
    });

    messages.push({
      role: "user",
      content: message
    });

    // 3️⃣ Gemini OpenAI-compatible endpoint
    const GEMINI_MODEL ="gemini-2.5-flash-lite";//"gemini-1.5-flash";//"gemini-2.5-flash-lite"; // safest stable
    const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;

    // 4️⃣ API Call
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages,
        temperature: 0.7
      })
    });




    //  const GEMINI_MODEL = "google/gemma-3-27b-it:free";//"gemini-2.5-flash-lite,gemini-1.5-flash";//"gemini-2.5-flash-lite"; // safest stable
    // const url = `https://openrouter.ai/api/v1/chat/completions`;

    // // 4️⃣ API Call
    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`//${process.env.GEMINI_API_KEY}
    //   },
    //   body: JSON.stringify({
    //     model: GEMINI_MODEL,
    //    messages: messages, // messages,
    //     temperature: 0.7
    //   })
    // });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini Error:", response.status, errText);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const data = await response.json();

    // 5️⃣ Safe extraction (OpenAI style)
    const answer =
      data.choices?.[0]?.message?.content || "No response";

    // 6️⃣ Save to DB
    await pool.query(
      `INSERT INTO chatbot (user_id, chattitle_id, user_question, gemini_answer)
       VALUES ($1,$2,$3,$4)`,
      [userId, chattitle_id, message, answer]
    );

    // 7️⃣ Respond to frontend
    res.status(200).json({ answer });

  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Server error" });
  }
};






























// clear chat messages by title id
exports.clearChatByTitleId = async (req, res) => {
  const { titleid } = req.params;

  if (!titleid) {
    return res.status(400).json({
      message: "Chat title id missing"
    });
  }

  try {
    // chatbot table-la அந்த title id-க்கு உள்ள messages delete
    const result = await pool.query(
      "DELETE FROM chatbot WHERE chattitle_id = $1",
      [titleid]
    );

    return res.status(200).json({
      message: "Chat messages cleared successfully",
      deletedCount: result.rowCount
    });

  } catch (error) {
    console.error("Clear chat error:", error);
    return res.status(500).json({
      message: "Server error while clearing chat"
    });
  }
};





















exports.deleteChatTitle = async (req, res) => {
  const { id } = req.params;

  console.log("Frontend அனுப்பிய chat title ID:", id);

  if (!id) {
    return res.status(400).json({ message: "Chat title ID is required" });
  }

  try {
    // 🔹 Delete all chat messages from chatbot table
    const deleteChats = await pool.query(
      "DELETE FROM chatbot WHERE chattitle_id = $1",
      [parseInt(id)]
    );

    console.log(`Deleted ${deleteChats.rowCount} chat messages from chatbot table`);

    // 🔹 Delete chat title itself from chattable table
    const deleteTitle = await pool.query(
      "DELETE FROM chattable WHERE chattitle_id = $1",
      [parseInt(id)]
    );

    console.log(`Deleted ${deleteTitle.rowCount} row from chattable`);

    res.json({
      success: true,
      message: `Deleted chat title ID ${id} and ${deleteChats.rowCount} related messages`
    });

  } catch (err) {
    console.error("Error deleting chat title:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};















//this is for ubdate chat title
exports.updateChatTitle = async (req, res) => {
  const id = parseInt(req.params.id, 10); // ✅ integer
  const { title_name } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid chat title id" });
  }

  try {
    const result = await pool.query(
      `UPDATE chattable
       SET title_name = $1
       WHERE chattitle_id = $2
       RETURNING *`,
      [title_name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Title not found" });
    }

    res.json({
      message: "Chat title updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Update chat title error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
















///this is for new password send to others provider registration ok
exports.setPassword = async (req, res) => {
  try {
    const userId = req.user.id; // JWT மூலம் user ID
    const { password } = req.body;

    // 1️⃣ Database-ல் existing password fetch பண்ணு
    const result = await pool.query(
      "SELECT password FROM registertable WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingPassword = result.rows[0].password;

    // 2️⃣ Already password set ஆகி இருந்தா message return பண்ணு
    if (existingPassword && existingPassword.trim() !== "") {
      return res.json({ success: false, message: "Password already set" });
    }

    // 3️⃣ Password validation
    if (!password || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password cannot be empty" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Update DB
    await pool.query(
      "UPDATE registertable SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};























// // this is resume creator all details send api 
// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });

// // ---------------- controller ----------------
// exports.submitResume = async (req, res) => {
//   try {
//     // 1️⃣ Get FormData fields
//   const { pagecount, pageOne, pageTwo, pageThree, photoBase64 } = req.body;

//     // 2️⃣ Get uploaded file
//     // const photo = req.file ? req.file.originalname : null;

//     // 3️⃣ Log received data
//     console.log("===== FORM DATA RECEIVED =====");
//     console.log("Page Count:", pagecount);
//     console.log("Page 1:", pageOne);
//     if (pagecount >= 2) console.log("Page 2:", pageTwo);
//     if (pagecount === 3) console.log("Page 3:", pageThree);
  
//     console.log("==============================");

//     // 4️⃣ Build prompt for Gemini
//     let prompt = `
// Generate an ATS-friendly professional resume in clean HTML.

// Rules (IMPORTANT):
// - Use a single-column layout only
// - Do NOT use tables
// - Do NOT use icons, emojis, images except profile photo
// - Use only standard HTML elements (h1, h2, h3, p, ul, li, section, div)
// - Keep font simple and readable
// - Avoid excessive colors or styling

// Include the following sections in this exact order:

// 1. Profile Photo
// Use this EXACT HTML (do not modify src or class):
// <img src="${photoBase64}" class="profile-photo" />

// Profile photo must NOT be circular.
// Do NOT use border-radius: 50%.
// Use border-radius: 10% for the photo.

// 2. Full Name
// 3. Job Title
// 4. Contact Information (Email, Phone, Location)
// 5. Professional Summary
// 6. Skills (bulleted list)
// 7. Experience
// 8. Projects
// 9. Education

// Use ONLY these details:
// ${JSON.stringify(pageOne, null, 2)}

// ATS rules:
// - Use clear section headings
// - Use bullet points for skills and experience
// - Do NOT use columns or sidebars
// - Content should be keyword-optimized and machine-readable

// Return ONLY valid HTML code.
// `;


// if (pagecount >= 2) {
//   prompt += `
// ====================
// HTML DOCUMENT 2 (PAGE 2)
// ====================
// Use ONLY these details:
// ${JSON.stringify(pageTwo, null, 2)}

// Include:
// - Experience
// - Projects
// - Certifications
// `;
// }

// if (pagecount === 3) {
//   prompt += `
// ====================
// HTML DOCUMENT 3 (PAGE 3)
// ====================
// Use ONLY these details:
// ${JSON.stringify(pageThree, null, 2)}
// `;
// }


//     // 5️⃣ Gemini API call (chat completion style)
//     const GEMINI_MODEL = "gemini-2.5-flash-lite"; // safer for chat
//     const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

//     const geminiResponse = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: GEMINI_MODEL,
//         messages: [
//           { role: "system", content: "You are an expert resume HTML generator." },
//           { role: "user", content: prompt },
//         ],
//         temperature: 0.7,
//       }),
//     });

//     if (!geminiResponse.ok) {
//       const errorText = await geminiResponse.text();
//       console.error("Gemini API error:", geminiResponse.status, errorText);
//       return res.status(500).json({ error: "Gemini API failed" });
//     }

//     const result = await geminiResponse.json();

//     // 6️⃣ Extract HTML from Gemini response
//     let geminiHTML = "No response from Gemini";
//     const parts = result?.choices?.[0]?.message?.content;
//     if (parts) geminiHTML = parts;

//     console.log("===== GEMINI HTML OUTPUT =====");
//     console.log(geminiHTML);
//     console.log("================================");

//     // 7️⃣ Send response to frontend
//     res.json({
//       message: "Resume HTML generated via Gemini",
//       html: geminiHTML,
//     });
//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Failed to generate resume" });
//   }
// };

// // ---------------- export multer upload ----------------
// // exports.upload = upload.single("photo");









// // controller/auth.controller.js

// exports.submitResume = async (req, res) => {
//   try {
//     // 1️⃣ Get data from JSON body (NOT FormData)
//     let { pagecount, pageOne, pageTwo, pageThree, photoBase64 } = req.body;

//     // Ensure number
//     pagecount = Number(pagecount || 1);

//     // Safety defaults
//     pageOne = pageOne || {};
//     pageTwo = pageTwo || {};
//     pageThree = pageThree || "";

//     // 2️⃣ Logs (debug)
//     console.log("===== FORM DATA RECEIVED =====");
//     console.log("Page Count:", pagecount);
//     console.log("Page 1:", pageOne);
//     if (pagecount >= 2) console.log("Page 2:", pageTwo);
//     if (pagecount === 3) console.log("Page 3:", pageThree);
//     console.log("Photo Base64 exists:", !!photoBase64);
//     console.log("==============================");

//     // 3️⃣ Build Gemini Prompt
//     let prompt = `
// Generate an ATS-friendly professional resume in clean HTML.

// Rules (IMPORTANT):
// - Use a single-column layout only
// - Do NOT use tables
// - Do NOT use icons, emojis, images except profile photo
// - Use only standard HTML elements (h1, h2, h3, p, ul, li, section, div)
// - Keep font simple and readable
// - Avoid excessive colors or styling

// Include the following sections in this exact order:

// 1. Profile Photo
// Use this EXACT HTML (do not modify src or class):
// <img src="${photoBase64 || ""}" class="profile-photo" />

// Profile photo must NOT be circular.
// Do NOT use border-radius: 50%.
// Use border-radius: 10% for the photo.

// 2. Full Name
// 3. Job Title
// 4. Contact Information (Email, Phone, Location)
// 5. Professional Summary
// 6. Skills (bulleted list)
// 7. Experience
// 8. Projects
// 9. Education

// Use ONLY these details:
// ${JSON.stringify(pageOne, null, 2)}

// ATS rules:
// - Use clear section headings
// - Use bullet points for skills and experience
// - Do NOT use columns or sidebars
// - Content should be keyword-optimized and machine-readable

// Return ONLY valid HTML code.
// `;

//     if (pagecount >= 2) {
//       prompt += `
// ====================
// PAGE 2 DETAILS
// ====================
// ${JSON.stringify(pageTwo, null, 2)}
// `;
//     }

//     if (pagecount === 3) {
//       prompt += `
// ====================
// PAGE 3 DETAILS
// ====================
// ${JSON.stringify(pageThree, null, 2)}
// `;
//     }

//     // 4️⃣ Gemini API Call
//     const fetch = (...args) =>
//       import("node-fetch").then(({ default: fetch }) => fetch(...args));

//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: "gemini-2.5-flash-lite",
//           messages: [
//             { role: "system", content: "You are an expert resume HTML generator." },
//             { role: "user", content: prompt },
//           ],
//           temperature: 0.6,
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Gemini API error:", errorText);
//       return res.status(500).json({ error: "Gemini API failed" });
//     }

//     const result = await response.json();

//     // 5️⃣ Extract HTML safely
//     const geminiHTML =
//       result?.choices?.[0]?.message?.content || "<!-- No HTML returned -->";

//     console.log("===== GEMINI HTML OUTPUT =====");
//     console.log(geminiHTML);
//     console.log("================================");

//     // 6️⃣ Send to frontend
//     res.json({
//       success: true,
//       html: geminiHTML,
//     });
//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Failed to generate resume" });
//   }
// };









// // // controller/auth.controller.js

// exports.submitResume = async (req, res) => {
//   try {
//     // 1️⃣ Get data from JSON body (NOT FormData)
//     let { pagecount, pageOne, pageTwo, pageThree, photoChunks } = req.body;

//     // Join photo chunks if they exist
//     let photoBase64 = "";
//     if (photoChunks && Array.isArray(photoChunks)) {
//       photoBase64 = photoChunks.join("");
//     }

//     // Ensure number
//     pagecount = Number(pagecount || 1);

//     // Safety defaults
//     pageOne = pageOne || {};
//     pageTwo = pageTwo || {};
//     pageThree = pageThree || "";

//     // 2️⃣ Logs (debug)
//     console.log("===== FORM DATA RECEIVED =====");
//     console.log("Page Count:", pagecount);
//     console.log("Page 1:", pageOne);
//     if (pagecount >= 2) console.log("Page 2:", pageTwo);
//     if (pagecount === 3) console.log("Page 3:", pageThree);
//     console.log("Photo Base64 exists:", !!photoBase64);
//     console.log("==============================");

//     // 3️⃣ Build Gemini Prompt
//     let prompt = `
// Generate an ATS-friendly professional resume in clean HTML.

// Rules (IMPORTANT):
// - Use a single-column layout only
// - Do NOT use tables
// - Do NOT use icons, emojis, images except profile photo
// - Use only standard HTML elements (h1, h2, h3, p, ul, li, section, div)
// - Keep font simple and readable
// - Avoid excessive colors or styling

// Include the following sections in this exact order:

// 1. Profile Photo
// Use this EXACT HTML (do not modify src or class):
// <img src="${photoBase64 || ""}" class="profile-photo" />

// Profile photo must NOT be circular.
// Do NOT use border-radius: 50%.
// Use border-radius: 10% for the photo.

// 2. Full Name
// 3. Job Title
// 4. Contact Information (Email, Phone, Location)
// 5. Professional Summary
// 6. Skills (bulleted list)
// 7. Experience
// 8. Projects
// 9. Education

// Use ONLY these details:
// ${JSON.stringify(pageOne, null, 2)}

// ATS rules:
// - Use clear section headings
// - Use bullet points for skills and experience
// - Do NOT use columns or sidebars
// - Content should be keyword-optimized and machine-readable

// Return ONLY valid HTML code.
// `;

//     if (pagecount >= 2) {
//       prompt += `
// ====================
// PAGE 2 DETAILS
// ====================
// ${JSON.stringify(pageTwo, null, 2)}
// `;
//     }

//     if (pagecount === 3) {
//       prompt += `
// ====================
// PAGE 3 DETAILS
// ====================
// ${JSON.stringify(pageThree, null, 2)}
// `;
//     }

//     // 4️⃣ Gemini API Call
//     const fetch = (...args) =>
//       import("node-fetch").then(({ default: fetch }) => fetch(...args));

//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: "gemini-2.5-flash-lite",
//           messages: [
//             { role: "system", content: "You are an expert resume HTML generator." },
//             { role: "user", content: prompt },
//           ],
//           temperature: 0.6,
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Gemini API error:", errorText);
//       return res.status(500).json({ error: "Gemini API failed" });
//     }

//     const result = await response.json();

//     // 5️⃣ Extract HTML safely
//     const geminiHTML =
//       result?.choices?.[0]?.message?.content || "<!-- No HTML returned -->";

//     console.log("===== GEMINI HTML OUTPUT =====");
//     console.log(geminiHTML);
//     console.log("================================");

//     // 6️⃣ Send to frontend
//     res.json({
//       success: true,
//       html: geminiHTML,
//     });
//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Failed to generate resume" });
//   }
// };



// // ===== UPLOAD FOLDER PATH =====
// const resumePhotosDir = path.join(__dirname, '../uploads/resume-photos');

// // ===== TIME AFTER WHICH FILES SHOULD BE DELETED =====
// const FILE_EXPIRATION = 10 * 60 * 1000; // 10 minutes

// // ===== FUNCTION TO DELETE OLD FILES =====
// function deleteOldFiles() {
//   fs.readdir(resumePhotosDir, (err, files) => {
//     if (err) return console.error('Error reading upload folder:', err);

//     files.forEach(file => {
//       const filePath = path.join(resumePhotosDir, file);

//       fs.stat(filePath, (err, stats) => {
//         if (err) return console.error('Error getting file stats:', err);

//         const now = Date.now();
//         const fileAge = now - stats.mtimeMs; // file modified time in ms

//         if (fileAge > FILE_EXPIRATION) {
//           fs.unlink(filePath, (err) => {
//             if (err) return console.error('Error deleting file:', err);
//             console.log('🗑️ Deleted old file:', file);
//           });
//         }
//       });
//     });
//   });
// }

// // ===== RUN AUTOMATICALLY EVERY MINUTE =====
// setInterval(deleteOldFiles, 60 * 1000);



// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// ===== UPLOAD FOLDER =====
const uploadDir = 'uploads/resume-photos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== MULTER STORAGE =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ===== MULTER UPLOAD CONFIG =====
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// 🔥 MULTER MIDDLEWARE
exports.uploadResumePhoto = upload.single('photo');

// ===== HELPER FUNCTION: DELETE OLD FILES EXCEPT CURRENT =====
async function deleteOldFilesExceptCurrent(folder, keepFile) {
  try {
    const files = await fs.promises.readdir(folder);
    for (const file of files) {
      if (file === keepFile) continue; // keep the newly uploaded file
      const filePath = path.join(folder, file);
      await fs.promises.unlink(filePath);
      console.log('🗑️ Deleted old file:', file);
    }
  } catch (err) {
    console.error('Error deleting old files:', err);
  }
}

// 🔥 HANDLE PHOTO UPLOAD RESPONSE
exports.handlePhotoUpload = async (req, res) => {
  try {
    // ===== CHECK IF FILE EXISTS =====
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file uploaded'
      });
    }

    // ===== DELETE OLD FILES AFTER UPLOAD (KEEP CURRENT) =====
    await deleteOldFilesExceptCurrent(uploadDir, req.file.filename);

    // Generate URL for the uploaded photo
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/resume-photos/${req.file.filename}`;

    console.log('✅ Photo uploaded successfully:', photoUrl);

    res.json({
      success: true,
      url: photoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Photo upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Photo upload failed',
      message: error.message
    });
  }
};









// 🔥 YOUR EXISTING submitResume FUNCTION (NO CHANGES NEEDED)
exports.submitResume = async (req, res) => {
  try {
    let { pagecount, pageOne, pageTwo, pageThree } = req.body;

    pagecount = Number(pagecount || 1);
    pageOne = pageOne || {};
    pageTwo = pageTwo || {};
    pageThree = pageThree || {};

    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

//     const buildPrompt = (pageNum, pageData) => `
// Create ONE single-page ATS-friendly professional resume in pure HTML.

// STRICT RULES:
// - Output must contain ONLY ONE <html> document
// - Use ONLY the given data for this page
// - Clean typography, professional spacing
// - Profile photo must be square or rectangle (NOT round)

// IMPORTANT:
// - Insert this EXACT <img> tag for the profile photo in the profile section:
// <img src="PHOTO_PLACEHOLDER_URL" class="profile-photo" />
// - Do NOT modify or replace this tag. Keep it exactly as is.
// - Do not add any other <img> tags for the profile photo.

// PAGE ${pageNum} DATA:
// ${JSON.stringify(pageData, null, 2)}
// `;
const buildPrompt = (pageNum, pageData, totalPages) => `
You are generating ONE PAGE of a MULTI-PAGE professional resume.

==============================
IMPORTANT CONTEXT
==============================
- Total resume pages: ${totalPages}
- You are generating ONLY PAGE ${pageNum}
- Each page is independent.
- NEVER repeat content from other pages.
- DO NOT recreate the full resume again.
- Use ONLY the data provided for THIS page.

==============================
STRICT OUTPUT RULES
==============================
- Output ONLY ONE complete HTML document.
- Must include <html>, <head>, and <body>.
- Do NOT output markdown.
- Do NOT wrap HTML inside \`\`\`.
- Do NOT add explanations or comments.
- Output must be valid clean HTML.

==============================
PHOTO RULE (VERY STRICT)
==============================
- PAGE 1 MUST ALWAYS include this EXACT image tag inside header:

<img src="PHOTO_PLACEHOLDER_URL" class="profile-photo" />

- Pages 2 and above MUST NOT include profile photo.
- Do NOT modify this tag.
- Do NOT create additional profile images.

==============================
DESIGN CONSISTENCY RULE (VERY IMPORTANT)
==============================
- All pages MUST use identical layout, typography, spacing, and colors.
- Continue the SAME design across all pages.
- Do NOT create a new theme or layout.
- Maintain ATS-friendly professional styling.
- Use clean modern resume styling with readable fonts.

==============================
SECTION RENDERING RULE (CRITICAL)
==============================
- Render ONLY sections present in this page data.
- DO NOT invent information.
- DO NOT remove valid fields.
- EVERY field present in the data MUST appear in the HTML output.
- NEVER skip fields even if they look optional.

==============================
FIELD → SECTION MAPPING (MANDATORY)
==============================
Convert fields into resume sections exactly like this:

fullName → Resume Header Name
jobTitle → Professional Title
email → Contact Information
phoneNumber → Contact Information
address → Contact Information
summary → Professional Summary
skills OR skill → Skills Section
linkedIn → LinkedIn Profile Link
github → GitHub Profile Link
education → Education Section
languages → Languages Section
certifications → Certifications Section
experience → Work Experience Section
projects → Projects Section
achievements → Achievements Section
volunteering → Volunteering Section
awards → Awards Section
notableProjects → Notable Projects Section
publications → Publications Section

If any field exists, it MUST be displayed professionally.

==============================
LAYOUT STRUCTURE RULE
==============================
- Header section at top.
- Contact details below name.
- Sections displayed using headings.
- Use semantic HTML:
  <section>, <h2>, <p>, <ul>, <li>
- Maintain consistent spacing and alignment.

==============================
PAGE ${pageNum} DATA (USE ONLY THIS)
==============================
${JSON.stringify(pageData, null, 2)}

==============================
FINAL VALIDATION RULE
==============================
If content not present in this page data is included, the output is INVALID.
If any provided field is missing in output, the output is INVALID.
`;



    const dummyHTML = (pageNum, data, showPhoto, totalPages) => `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Resume</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.7; color: #333; background: #f9f9f9; padding: 40px; }
.container { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.name-title h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
}
.name-title h2 { font-size: 18px; font-weight: 500; color: #162447; margin-top: 4px; }
.profile-photo { width: 130px; height: auto; border-radius: 10px; border: 2px solid #162447; }
.contact { margin-top: 12px; font-size: 13px; color: #555; }
.contact p { margin-bottom: 4px; }
.contact span { color: #162447; font-weight: 600; }
.section { margin-top: 28px; }
.section h3 { font-size: 16px; font-weight: 700; color: #162447; border-bottom: 2px solid #1f4068; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.section p, .section ul { margin-bottom: 8px; }
.skills-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.skill-pill { background: #1f4068; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
.signature { text-align: right; margin-top: 50px; font-style: italic; font-weight: bold; font-size: 14px; color: #1a1a2e; }
@media print { body { padding: 10px; } h1,h2,h3 { background: none !important; } * { -webkit-print-color-adjust: economy !important; print-color-adjust: economy !important; } }
</style>
</head>
<body>
<div class="container">

${pageNum === 1 ? `
<div class="header">
  <div class="name-title">
    <h1>${data.fullName || "Your Name"}</h1>
    <h2>${data.jobTitle || "Job Title"}</h2>
    <div class="contact">
      <p><span>Email:</span> ${data.email || "-"}</p>
      <p><span>Phone:</span> ${data.phoneNumber || "-"}</p>
      <p><span>Address:</span> ${data.address || "-"}</p>
      <p><span>LinkedIn:</span> ${data.linkedIn || "-"}</p>
      <p><span>GitHub:</span> ${data.github || "-"}</p>
    </div>
  </div>
  ${showPhoto ? `<img src="PHOTO_PLACEHOLDER_URL" class="profile-photo" />` : ""}
</div>
<div class="section"><h3>Professional Summary</h3><p>${data.summary || "-"}</p></div>
<div class="section"><h3>Skills</h3><div class="skills-container">${(data.skill || "").split(",").map(s => `<div class="skill-pill">${s.trim()}</div>`).join("")}</div></div>
<div class="section"><h3>Education</h3><p>${data.education || "-"}</p></div>
<div class="section"><h3>Languages</h3><p>${data.languages || "-"}</p></div>
<div class="section"><h3>Certifications</h3><p>${data.certifications || "-"}</p></div>
` : ""}

${pageNum === 2 ? `
<div class="section"><h3>Experience</h3><p>${data.experience || "-"}</p></div>
<div class="section"><h3>Projects</h3><p>${data.projects || "-"}</p></div>
<div class="section"><h3>Certifications</h3><p>${data.certifications || "-"}</p></div>
<div class="section"><h3>Achievements</h3><p>${data.achievements || "-"}</p></div>
<div class="section"><h3>Volunteering</h3><p>${data.volunteering || "-"}</p></div>
<div class="section"><h3>Awards</h3><p>${data.awards || "-"}</p></div>
<div class="section"><h3>Notable Projects</h3><p>${data.notableProjects || "-"}</p></div>
<div class="section"><h3>Publications</h3><p>${data.publications || "-"}</p></div>
` : ""}

${pageNum === 3 ? `
<div class="section"><h3>Languages</h3><p>${data.languages || "-"}</p></div>
<div class="section"><h3>Achievements</h3><p>${data.achievements || "-"}</p></div>
<div class="section"><h3>Interests</h3><p>${data.interests || "-"}</p></div>
<div class="section"><h3>Soft Skills</h3><p>${data.softSkills || "-"}</p></div>
<div class="section"><h3>Hobbies</h3><p>${data.hobbies || "-"}</p></div>
<div class="section"><h3>Community</h3><p>${data.community || "-"}</p></div>
` : ""}

${pageNum === totalPages ? `<div class="signature">Submitted by: ${pageOne.fullName || "Your Name"}</div>` : ""}

</div>
</body>
</html>
`;

    let finalHTML = "";

//     for (let i = 1; i <= pagecount; i++) {
//       const pageData = i === 1 ? pageOne : i === 2 ? pageTwo : pageThree;
//     // const GEMINI_MODEL ="gemini-2.5-flash-lite";//"gemini-1.5-flash";//"gemini-2.5-flash-lite"; // safest stable
//     // const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;

//       try {
//         const response = await fetch(
//  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               contents: [
//                 { role: "user", parts: [{ text: buildPrompt(i, pageData) }] }
//               ]
//             })
//           }
//         );
for (let i = 1; i <= pagecount; i++) {

  const pageData = i === 1 ? pageOne : i === 2 ? pageTwo : pageThree;

  let html = "";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(i, pageData, pagecount) }]
            }
          ]
        })
      }
    );

    if (!response.ok) throw new Error("Gemini failed");

    const result = await response.json();

    html =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    if (!html.includes("<html")) throw new Error("Invalid HTML");

    console.log(`✅ Gemini page ${i} OK`);

  } catch (err) {
    console.warn(`⚠️ Gemini failed page ${i}, using dummy`);
    html = dummyHTML(i, pageData, i === 1 && pageOne.photoUrl, pagecount);
  }

  // ================= PHOTO FORCE INSERT =================
  const photoURL =
    pageOne.photoUrl ||
    pageOne.photo ||
    pageOne.photoBase64;

  if (photoURL && i === 1) {
    console.log("🔥 Forcing profile photo injection");

    if (html.includes("PHOTO_PLACEHOLDER_URL")) {
      html = html.replace(/PHOTO_PLACEHOLDER_URL/g, photoURL);
    }
    else if (!html.includes("profile-photo")) {
      html = html.replace(
        /<body[^>]*>/i,
        `$& 
        <div class="resume-header">
          <img src="${photoURL}" class="profile-photo" />
        </div>`
      );

      console.log("✅ Photo manually injected");
    }
  }
  // ======================================================

  finalHTML += html;
}


    // 🔥 AGGRESSIVE PHOTO REPLACEMENT
    // if (pageOne.photoUrl) {
    //   console.log("🔥 Backend: Replacing photo with URL:", pageOne.photoUrl);

    //   finalHTML = finalHTML.replace(/PHOTO_PLACEHOLDER_URL/g, pageOne.photoUrl);
    //   finalHTML = finalHTML.replace(
    //     /<img\s+src=["']["']\s+class=["']profile-photo["']\s*\/?>/gi,
    //     `<img src="${pageOne.photoUrl}" class="profile-photo" />`
    //   );
    //   finalHTML = finalHTML.replace(
    //     /<img[^>]*class=["']profile-photo["'][^>]*>/gi,
    //     `<img src="${pageOne.photoUrl}" class="profile-photo" />`
    //   );
    //   finalHTML = finalHTML.replace(
    //     /<img\s+src=["'][^"']*["']\s+class=["']profile-photo["']\s*\/?>/gi,
    //     `<img src="${pageOne.photoUrl}" class="profile-photo" />`
    //   );

    //   console.log("✅ Backend: Photo replacement complete");
    // }

    res.json({
      success: true,
      html: finalHTML,
      photoUrl: pageOne.photoUrl || null
    });

  } catch (err) {
    console.error("submitResume error:", err);
    res.status(500).json({
      error: "Resume generation failed",
      message: err.message
    });
  }
};

//1,2,3
// // controller/auth.controller.js
// exports.submitResume = async (req, res) => {
//   try {
//     let { pagecount, pageOne, pageTwo, pageThree, photoChunks } = req.body;

//     // Join photo chunks into single Base64 string
//     let photoBase64 = "";
//     if (photoChunks && Array.isArray(photoChunks)) {
//       photoBase64 = photoChunks.join("");
//     }

//     pagecount = Number(pagecount || 1);
//     pageOne = pageOne || {};
//     pageTwo = pageTwo || {};
//     pageThree = pageThree || {};

//     console.log("===== FORM DATA =====");
//     console.log("Page Count:", pagecount);
//     console.log("Page 1:", pageOne);
//     if (pagecount >= 2) console.log("Page 2:", pageTwo);
//     if (pagecount === 3) console.log("Page 3:", pageThree);
//     console.log("Photo Base64 exists:", !!photoBase64);
//     console.log("====================");

//     // Gemini Prompt
//     let prompt = `
// Generate an ATS-friendly resume in clean HTML.

// Use this photo:
// <img src="${photoBase64 || ""}" class="profile-photo" />

// Page 1 Details:
// ${JSON.stringify(pageOne, null, 2)}

// ${pagecount >= 2 ? `Page 2 Details:\n${JSON.stringify(pageTwo, null, 2)}` : ""}
// ${pagecount === 3 ? `Page 3 Details:\n${JSON.stringify(pageThree, null, 2)}` : ""}
// `;

//     // 1️⃣ Gemini API call
//     let htmlPages = [];
//     try {
//       const fetch = (...args) =>
//         import("node-fetch").then(({ default: fetch }) => fetch(...args));

//       const response = await fetch(
//         "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//           },
//           body: JSON.stringify({
//             model: "gemini-2.5-flash-lite",
//             messages: [
//               { role: "system", content: "You are an expert resume HTML generator." },
//               { role: "user", content: prompt },
//             ],
//             temperature: 0.6,
//           }),
//         }
//       );

//       if (!response.ok) throw new Error("Gemini API failed");

//       const result = await response.json();
//       let geminiHTML = result?.choices?.[0]?.message?.content || "";

//       // Split into pages by </html>
//       htmlPages = geminiHTML
//         .split("</html>")
//         .map(p => p.trim())
//         .filter(p => p.length > 0)
//         .map(p => p + "</html>");

//       if (htmlPages.length === 0) throw new Error("Empty Gemini HTML");

//     } catch (err) {
//       console.warn("Gemini failed or quota exceeded. Using dummy HTML.");

//       // Dummy HTML generator per page
//       const generateDummyHTML = (pageNum, pageData, includePhoto) => {
//         return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <title>Resume - ${pageData.fullName || "Candidate"}</title>
// <style>
//   body { font-family: Arial, sans-serif; line-height: 1.5; margin: 20px; }
//   .profile-photo { width: 150px; border-radius: 10%; }
//   h1, h2, h3 { margin-bottom: 5px; }
//   ul { margin: 0; padding-left: 20px; }
// </style>
// </head>
// <body>
// ${includePhoto ? `<img src="${photoBase64 || ""}" class="profile-photo" />` : ""}
// ${pageNum === 1 ? `
// <h1>${pageData.fullName || "Full Name"}</h1>
// <h2>${pageData.jobTitle || "Job Title"}</h2>
// <p>Email: ${pageData.email || "email@example.com"}</p>
// <p>Phone: ${pageData.phoneNumber || "000-000-0000"}</p>
// <p>Address: ${pageData.address || "Address"}</p>
// <h3>Summary</h3>
// <p>${pageData.summary || "Professional summary goes here."}</p>
// <h3>Skills</h3>
// <ul>
// ${(pageData.skill || "Skill1, Skill2, Skill3").split(",").map(s => `<li>${s.trim()}</li>`).join("")}
// </ul>
// ` : ""}
// ${pageNum === 2 ? `
// <h3>Experience</h3>
// <p>${pageData.experience || "Experience details go here."}</p>
// <h3>Projects</h3>
// <p>${pageData.projects || "Projects go here."}</p>
// <h3>Certifications</h3>
// <p>${pageData.certifications || "Certifications go here."}</p>
// ` : ""}
// ${pageNum === 3 ? `
// <h3>Languages</h3>
// <p>${pageData.languages || "Languages go here."}</p>
// <h3>Achievements</h3>
// <p>${pageData.achievements || "Achievements go here."}</p>
// <h3>Interests</h3>
// <p>${pageData.interests || "Interests go here."}</p>
// ` : ""}
// </body>
// </html>`;
//       };

//       htmlPages.push(generateDummyHTML(1, pageOne, true));
//       if (pagecount >= 2) htmlPages.push(generateDummyHTML(2, pageTwo, false));
//       if (pagecount === 3) htmlPages.push(generateDummyHTML(3, pageThree, false));
//     }

//     // Send pages array to frontend
//     res.json({
//       success: true,
//       htmlPages,
//     });

//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Failed to generate resume" });
//   }
// };









//last 

// exports.submitResume = async (req, res) => {
//   try {
//     let { pagecount, pageOne, pageTwo, pageThree, photoChunks } = req.body;
//     pagecount = Number(pagecount || 1);
//     pageTwo = pageTwo || {};
//     pageThree = pageThree || {};

//     // 🟢 Join Base64 photo if exists
//     let photoBase64 = "";
//     if (Array.isArray(photoChunks)) {
//       photoBase64 = photoChunks.join("");
//       pageOne.photoBase64 = photoBase64; // assign for dummy HTML
//     }

//     const fetch = (...args) =>
//       import("node-fetch").then(({ default: fetch }) => fetch(...args));

//     // 🟢 PROFESSIONAL PROMPT BUILDER
// //     const buildPrompt = (pageNum, pageData) => `
// // Create ONE single-page ATS-friendly professional resume in pure HTML.

// // STRICT RULES:
// // - Output must contain ONLY ONE <html> document
// // - Use ONLY the given data for this page
// // - No gradient or background color for name
// // - Clean typography, professional spacing
// // - Profile photo must be square or rectangle (NOT round)

// // PROFILE PHOTO:
// // <img src="${photoBase64}" class="profile-photo" />

// // PAGE ${pageNum} DATA:
// // ${JSON.stringify(pageData, null, 2)}
// // `;
// const buildPrompt = (pageNum, pageData) => `
// Create ONE single-page ATS-friendly professional resume in pure HTML.

// STRICT RULES:
// - Output must contain ONLY ONE <html> document
// - Use ONLY the given data for this page
// - Clean typography, professional spacing
// - Profile photo must be square or rectangle (NOT round)

// IMPORTANT:
// Insert exactly this HTML tag for the profile photo:
// <img src="${photoBase64}" class="profile-photo" />
// Do NOT remove, modify, or replace this tag. Keep it exactly as is.

// PAGE ${pageNum} DATA:
// ${JSON.stringify(pageData, null, 2)}
// `;


//     // 🟢 Dummy HTML fallback
//     const dummyHTML = (pageNum, data, showPhoto, totalPages) => `
// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8" />
// <title>Resume</title>
// <style>
// * { margin: 0; padding: 0; box-sizing: border-box; }
// body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.7; color: #333; background: #f9f9f9; padding: 40px; }
// .container { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
// .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
// .name-title h1 {
//   font-size: 32px;
//   font-weight: 700;
//   color: #1a1a2e; /* text color */
//   background: none !important; /* force remove any background */
//   -webkit-background-clip: unset !important; /* remove text clip */
//   -webkit-text-fill-color: unset !important; /* remove fill */
// }

// .name-title h2 { font-size: 18px; font-weight: 500; color: #162447; margin-top: 4px; }
// .profile-photo { width: 130px; height: auto; border-radius: 10px; border: 2px solid #162447; }
// .contact { margin-top: 12px; font-size: 13px; color: #555; }
// .contact p { margin-bottom: 4px; }
// .contact span { color: #162447; font-weight: 600; }
// .section { margin-top: 28px; }
// .section h3 { font-size: 16px; font-weight: 700; color: #162447; border-bottom: 2px solid #1f4068; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
// .section p, .section ul { margin-bottom: 8px; }
// .skills-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
// .skill-pill { background: #1f4068; color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }
// .signature { text-align: right; margin-top: 50px; font-style: italic; font-weight: bold; font-size: 14px; color: #1a1a2e; }
// @media print { body { padding: 10px; } h1,h2,h3 { background: none !important; } * { -webkit-print-color-adjust: economy !important; print-color-adjust: economy !important; } }
// </style>
// </head>
// <body>
// <div class="container">

// ${pageNum === 1 ? `
// <div class="header">
//   <div class="name-title">
//     <h1>${data.fullName || "Your Name"}</h1>
//     <h2>${data.jobTitle || "Job Title"}</h2>
//     <div class="contact">
//       <p><span>Email:</span> ${data.email || "-"}</p>
//       <p><span>Phone:</span> ${data.phoneNumber || "-"}</p>
//       <p><span>Address:</span> ${data.address || "-"}</p>
//       <p><span>LinkedIn:</span> ${data.linkedIn || "-"}</p>
//       <p><span>GitHub:</span> ${data.github || "-"}</p>
//     </div>
//   </div>
//   ${showPhoto && data.photoBase64 ? `<img src="${data.photoBase64}" class="profile-photo" />` : ""}
// </div>
// <div class="section"><h3>Professional Summary</h3><p>${data.summary || "-"}</p></div>
// <div class="section"><h3>Skills</h3><div class="skills-container">${(data.skill || "").split(",").map(s => `<div class="skill-pill">${s.trim()}</div>`).join("")}</div></div>
// <div class="section"><h3>Education</h3><p>${data.education || "-"}</p></div>
// <div class="section"><h3>Languages</h3><p>${data.languages || "-"}</p></div>
// <div class="section"><h3>Certifications</h3><p>${data.certifications || "-"}</p></div>
// ` : ""}

// ${pageNum === 2 ? `
// <div class="section"><h3>Experience</h3><p>${data.experience || "-"}</p></div>
// <div class="section"><h3>Projects</h3><p>${data.projects || "-"}</p></div>
// <div class="section"><h3>Certifications</h3><p>${data.certifications || "-"}</p></div>
// <div class="section"><h3>Achievements</h3><p>${data.achievements || "-"}</p></div>
// <div class="section"><h3>Volunteering</h3><p>${data.volunteering || "-"}</p></div>
// <div class="section"><h3>Awards</h3><p>${data.awards || "-"}</p></div>
// <div class="section"><h3>Notable Projects</h3><p>${data.notableProjects || "-"}</p></div>
// <div class="section"><h3>Publications</h3><p>${data.publications || "-"}</p></div>
// ` : ""}

// ${pageNum === 3 ? `
// <div class="section"><h3>Languages</h3><p>${data.languages || "-"}</p></div>
// <div class="section"><h3>Achievements</h3><p>${data.achievements || "-"}</p></div>
// <div class="section"><h3>Interests</h3><p>${data.interests || "-"}</p></div>
// <div class="section"><h3>Soft Skills</h3><p>${data.softSkills || "-"}</p></div>
// <div class="section"><h3>Hobbies</h3><p>${data.hobbies || "-"}</p></div>

// <div class="section"><h3>Community</h3><p>${data.community || "-"}</p></div>
// ` : ""}

// ${pageNum === totalPages ? `<div class="signature">Submitted by: ${pageOne.fullName || "Your Name"}</div>` : ""}

// </div>
// </body>
// </html>
// `;

//     // 🔵 Loop page by page
//     let finalHTML = "";
//     for (let i = 1; i <= pagecount; i++) {
//       const pageData = i === 1 ? pageOne : i === 2 ? pageTwo : pageThree;

//       try {
//         const response = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               contents: [
//                 { role: "user", parts: [{ text: buildPrompt(i, pageData) }] }
//               ]
//             })
//           }
//         );

//         if (!response.ok) throw new Error("Gemini failed");

//         const data = await response.json();
//         const html = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
//         if (!html.includes("<html")) throw new Error("Invalid HTML");

//         console.log(`✅ Gemini page ${i} OK`);
//         finalHTML += html;

//       } catch (err) {
//         console.warn(`⚠️ Gemini failed page ${i}, using dummy`);
//         finalHTML += dummyHTML(i, pageData, i === 1, pagecount); // <-- pass totalPages here
//       }
//     }

//     // 🟢 Return final HTML
//     res.json({ success: true, html: finalHTML });

//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Resume generation failed" });
//   }
// };



// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// ===============================
// 📌 MULTER CONFIG
// ===============================
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = "uploads";
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath);
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// exports.upload = multer({ storage });


// // ===============================
// // 📌 PHOTO UPLOAD API
// // ===============================
// exports.uploadPhoto = (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

//     res.json({
//       success: true,
//       url: photoUrl
//     });

//   } catch (err) {
//     console.error("Photo upload error:", err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// };


// // ===============================
// // 📌 RESUME GENERATION API
// // ===============================
// exports.submitResume = async (req, res) => {
//   try {

//     let { pagecount, pageOne, pageTwo, pageThree } = req.body;

//     pagecount = Number(pagecount || 1);
//     pageOne = pageOne || {};
//     pageTwo = pageTwo || {};
//     pageThree = pageThree || {};

//     const fetch = (...args) =>
//       import("node-fetch").then(({ default: fetch }) => fetch(...args));

//     // ---------------- PROMPT BUILDER ----------------
//     const buildPrompt = (pageNum, pageData) => `
// Create ONE single-page ATS-friendly professional resume in pure HTML.

// STRICT RULES:
// - Output must contain ONLY ONE <html> document
// - Clean typography
// - Include this EXACT tag:
// <img src="" class="profile-photo" />

// PAGE ${pageNum} DATA:
// ${JSON.stringify(pageData, null, 2)}
// `;

//     // ---------------- DUMMY HTML ----------------
//     const dummyHTML = (pageNum, data, totalPages) => `
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>Resume</title>
// <style>
// body { font-family: Arial; padding: 30px; }
// .profile-photo { width: 130px; border-radius: 10px; }
// .section { margin-top: 20px; }
// </style>
// </head>
// <body>

// ${pageNum === 1 ? `
// <h1>${data.fullName || "Your Name"}</h1>
// <h3>${data.jobTitle || "Job Title"}</h3>
// <img src="${data.photoUrl || ""}" class="profile-photo" />

// <div class="section"><b>Email:</b> ${data.email || "-"}</div>
// <div class="section"><b>Phone:</b> ${data.phoneNumber || "-"}</div>
// <div class="section"><b>Summary:</b> ${data.summary || "-"}</div>
// ` : ""}

// ${pageNum === totalPages ? `
// <div class="section">
// <b>Submitted by:</b> ${pageOne.fullName || "Your Name"}
// </div>
// ` : ""}

// </body>
// </html>
// `;

//     // ---------------- GENERATE PAGES ----------------
//     let finalHTML = "";

//     for (let i = 1; i <= pagecount; i++) {

//       const pageData =
//         i === 1 ? pageOne :
//         i === 2 ? pageTwo :
//         pageThree;

//       try {

//         if (!process.env.GEMINI_API_KEY) {
//           throw new Error("No Gemini key");
//         }

//         const response = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               contents: [
//                 {
//                   role: "user",
//                   parts: [{ text: buildPrompt(i, pageData) }]
//                 }
//               ]
//             })
//           }
//         );

//         if (!response.ok) throw new Error("Gemini failed");

//         const result = await response.json();

//         let html =
//           result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//         if (!html.includes("<html")) {
//           throw new Error("Invalid HTML");
//         }

//         // 🔥 Replace photo for page 1
//         if (i === 1 && pageOne.photoUrl) {
//           html = html.replace(
//             /<img\s+src=["'].*?["']\s+class=["']profile-photo["']\s*\/?>/,
//             `<img src="${pageOne.photoUrl}" class="profile-photo" />`
//           );
//         }

//         finalHTML += html;

//       } catch (err) {

//         console.warn(`Gemini failed page ${i}, using dummy`);

//         finalHTML += dummyHTML(i, pageData, pagecount);
//       }
//     }

//     res.json({ success: true, html: finalHTML });

//   } catch (err) {
//     console.error("submitResume error:", err);
//     res.status(500).json({ error: "Resume generation failed" });
//   }
// };





//save resume to user_all_resume table 
// auth.controller.js
 // your Postgres pool

 // your Postgres pool

exports.saveResume = async (req, res) => {
  try {
    // ✅ User ID from JWT
    const userId = req.user.id;

    // ✅ Match frontend keys
    const { title, htmlPages } = req.body;

    // 🔹 Validate input
    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    if (!Array.isArray(htmlPages) || htmlPages.length === 0) {
      return res.status(400).json({ success: false, error: "No resume pages provided" });
    }

    // 🔹 Combine all HTML pages into one string
    const combinedHTML = htmlPages.join("\n\n<!-- PAGE BREAK -->\n\n");

    // 🔹 Direct insert query
    const result = await pool.query(
      `INSERT INTO user_all_resumes (user_id, title_name, html_codes)
       VALUES ($1, $2, $3)
       RETURNING title_id, title_name, created_time`,
      [userId, title.trim(), combinedHTML]
    );

    // 🔹 Console log
    console.log("===== SAVE RESUME REQUEST =====");
    console.log("User ID from JWT:", userId);
    console.log("Title from UI:", title);
    console.log("Number of HTML pages:", htmlPages.length);
    htmlPages.forEach((page, idx) => {
      console.log(`Page ${idx + 1} preview (first 200 chars):`, page.slice(0, 200));
    });
    console.log("Inserted resume ID:", result.rows[0].title_id);
    console.log("===============================");

    // 🔹 Response
    res.json({ success: true, message: "Resume saved successfully ✅", data: result.rows[0] });

  } catch (err) {
    console.error("Error saving resume:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

















exports.getAllTitles =async (req,res)=>{
  try{
       const userId = req.user.id;
       const {rows}=await pool.query(
          `SELECT title_id, title_name 
       FROM user_all_resumes 
       WHERE user_id = $1
       ORDER BY created_time DESC`,
      [userId]
       );
       
       console.log("Fetched rows:", rows);
    return res.status(200).json(rows);
  }
  catch(error){
    console.error("get all titles in backend",error);
    res.status(500).json({
       message: "Internal server error"
    })
  }
}


















exports.updateResumeTitle = async (req, res) => {
  const { titleId, titleName } = req.body;

  if (!titleId || !titleName) {
    return res.status(400).json({
      message: "Title ID and Title Name required"
    });
  }

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE user_all_resumes 
       SET title_name = $1 
       WHERE title_id = $2 
       RETURNING title_id, title_name`,
      [titleName, titleId]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Title not found"
      });
    }

    return res.status(200).json({
      message: "Title updated successfully",
      updatedTitle: rows[0]
    });

  } catch (error) {
    console.error("Update title error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};











exports.deleteResumeTitle = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Title ID required"
    });
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM user_all_resumes 
       WHERE title_id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Title not found"
      });
    }

    return res.status(200).json({
      message: "Title deleted successfully"
    });

  } catch (error) {
    console.error("Delete title error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};





// getResumeHTML 
exports.getResumeHTML  = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // coming from JWT middleware

  // validation
  if (!id) {
    return res.status(400).json({
      message: "Resume ID is required"
    });
  }

  try {
    const { rows } = await pool.query(
      `SELECT html_codes
       FROM user_all_resumes
       WHERE title_id = $1 AND user_id = $2`,
      [id, userId]
    );

    // if resume not found
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    // send HTML back
    return res.status(200).json({
      html: rows[0].html_codes
    });

  } catch (error) {
    console.error("Get Resume HTML Error:", error);
    return res.status(500).json({
      message: "Server error while fetching resume"
    });
  }
};



































////mock interview sgtart here 
exports.interviewUser = async (req, res) => {
  try {

    const { role, text } = req.body;

    console.log("User Message Received:");
    console.log("Role:", role);
    console.log("Text:", text);

    res.json({
      success: true,
      message: "Message received"
    });

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error" });
  }
};




// exports.sendinterviewchat = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
//     const model = "arcee-ai/trinity-large-preview:free";

//     // AI-க்கான கட்டளைகள் (System Prompt)
// const systemPrompt = `
//   You are a friendly MERN Stack Interviewer, acting like a supportive senior/brother for a Fresher candidate.

//   Rules:
//   1. CORE STYLE: Keep responses very short, encouraging, and casual. Use simple English for questions.
//   2. CORRECT ANSWER: Just say "Super!", "Correct!", or "Nice job!" and move to the next question immediately. NO TAMIL HERE.
//   3. WRONG ANSWER / "I DON'T KNOW" / "EXPLAIN THAT": 
//      - First, give a 1-sentence clear English explanation.
//      - Second, give a 1-sentence Tanglish explanation (Tamil + English mixed).
//      - Tanglish Style: Use words like "pannuvom", "irukkum", "thaan", "vanthu". 
//      - Example: "Node.js is a runtime for JavaScript. JavaScript-ah server-side-la run panna Node.js use aagum."
//   4. GREETINGS: Keep it simple. "Hey! Ready to start the interview?"
//   5. ENDING: Every single reply MUST end with one short MERN technical question suitable for a fresher.
//   6. TONE: Very friendly, no robotic words, no pure Tamil (like 'சேவையகம்').
// `;
//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: model,
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message }
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const aiReply = response.data.choices[0].message.content;

//     return res.status(200).json({
//       reply: aiReply
//     });

//   } catch (error) {
//     console.error("Interview chat error:", error.message);
//     return res.status(500).json({
//       message: "AI interview server error",
//     });
//   }
// };
exports.sendinterviewchat = async (req, res) => {
  try {
    const { message, oldData } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const model = "llama-3.1-8b-instant";

    // 1. storedInterviewContext-ல் இருந்து ரெஸ்யூம் டேட்டாவை எடுத்து ஒரு ஸ்டிரிங்காக மாற்றுகிறோம்
// 1. Adding the Notes field here so the AI can see it
    const resumeDetails = storedInterviewContext ? `
      - Domain: ${storedInterviewContext.domain}
      - Manual Skills: ${storedInterviewContext.manualSkills || 'N/A'}
      - Resume Content: ${storedInterviewContext.resumeContent || 'N/A'}
      - Project Content: ${storedInterviewContext.projectResume || 'N/A'}
      - Extra Notes: ${storedInterviewContext.notes || 'N/A'} 
      - Difficulty: ${storedInterviewContext.difficulty}/5
    ` : "No context found.";

// const systemPrompt = `
//   Role: You are 'Anna', a Senior Python Mentor. 

//   STRICT CONTEXT FILTERS:
//   1. DOMAIN: ${storedInterviewContext?.domain}
//   2. SKILLS: ${storedInterviewContext?.manualSkills}
//   3. RESUME: ${storedInterviewContext?.resumeContent}
//   4. PROJECTS: ${storedInterviewContext?.projectResume}
//   5. NOTES: ${storedInterviewContext?.notes}

//   QUESTION COUNT RULES:
//   - Difficulty 1-2: 10 Questions.
//   - Difficulty 3-4: 15 Questions.
//   - Difficulty 5-6: 20 Questions.

//   INTERVIEW MANDATE:
//   - WRONG ANSWER: Briefly correct the user, then ask the next question.
//   - CORRECT ANSWER: Start with "Great!", "Perfect!", or "Excellent!", then ask the next question.
//   - STRUCTURE: Every response MUST end with exactly one question.
//   - DATA: Stay strictly within the user's provided resume and projects.

//   WORD COUNT CONTROL (STRICT):
//   - Minimum: 10 words.
//   - Maximum: 20 words. (Never exceed 20 words per message).

//   FIRST MESSAGE:
//   - Hi, I'm Anna. Analyzed your ${storedInterviewContext?.domain} profile. Let's start ${storedInterviewContext?.difficulty <= 2 ? '10' : storedInterviewContext?.difficulty <= 4 ? '15' : '20'} questions. Ready?

//   FINISHING THE INTERVIEW:
//   - After reaching the question limit, provide a final correction (if needed) and say: "Interview complete! Great effort today, keep practicing!"

//   TONE: Professional English. No Tamil.
// `;


const systemPrompt = `
  Role: You are 'Anna', a interviewer. 

  STRICT CONTEXT:
  - Source: ${storedInterviewContext?.domain}, ${storedInterviewContext?.manualSkills}, ${storedInterviewContext?.resumeContent}, ${storedInterviewContext?.projectResume}.
  - Logic: Use ONLY the data above. No generic Python questions.

  STRICT QUESTION COUNT (Excluding Intro):
  - Initial Task: Ask for a brief Self-Introduction first.
  - After Intro, ask EXACTLY:
    * Difficulty 1-2: 10 Questions.
    * Difficulty 3-4: 15 Questions.
    * Difficulty 5-6: 20 Questions.
  - TERMINATION: Stop exactly after the last question. Do NOT ask a new question in the final message.

  INTERVIEW FLOW:
  - WRONG ANSWER: Max 10-word correction + Next question.
  - CORRECT ANSWER: "Great/Excellent!" + Next question.
  - EVERY response (except final) must end with a question.

  WORD COUNT (MANDATORY):
  - Range: 10 to 20 words per message.
  - NEVER exceed 20 words. Be extremely concise.

  FINAL MESSAGE:
  - Provide final correction (if any) + "Interview complete! Great effort today, keep practicing!"

  TONE: Professional English only. No Tamil.
`;
    // 2. Chat History formatting
    const formattedHistory = (oldData || []).map(msg => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));

    // 3. Groq API Call
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: message }
        ],
        temperature: 0.6
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    return res.status(200).json({ success: true, reply: aiReply });

  } catch (error) {
    console.error("Interview error:", error.message);
    return res.status(500).json({ success: false, message: "AI Sync Error" });
  }
};

















// கோப்பின் மேலே இதை மட்டும் டிக்ளேர் செய்யவும்
let storedInterviewContext = null;

// தாமதத்தை உருவாக்க ஒரு ஹெல்பர் ஃபங்ஷன்
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🚀 Store Context Function
exports.storeContext = async (req, res) => {
    try {
        const { resumeInfo } = req.body;

        if (!resumeInfo) {
            return res.status(400).json({ success: false, message: "No data received" });
        }

        // 📝 பேக்கெண்ட் கன்சோலில் முழு விவரங்களை அச்சிடுதல்
        console.log("\n======= 📥 NEW INTERVIEW DATA RECEIVED =======");
        
        const summaryTable = {
            "Interview Type": resumeInfo.interviewType,
            "Target Domain": resumeInfo.domain,
            "Difficulty": resumeInfo.difficulty,
            "Has Manual Skills": !!resumeInfo.manualSkills,
            "Has PDF Content": !!resumeInfo.resumeContent,
            "Has HTML Content": !!resumeInfo.projectResume
        };
        console.table(summaryTable);

        // விரிவான விவரங்கள் கன்சோலில்
        if (resumeInfo.manualSkills) {
            console.log("🔹 MANUAL SKILLS:", resumeInfo.manualSkills);
        }

        if (resumeInfo.resumeContent) {
            console.log("🔹 PDF CONTENT (FULL):");
            console.log(resumeInfo.resumeContent); 
        }

        if (resumeInfo.projectResume) {
            console.log("🔹 HTML CONTENT (FULL):");
            console.log(resumeInfo.projectResume);
        }

        if (resumeInfo.notes) {
            console.log("🔹 EXTRA NOTES:", resumeInfo.notes);
        }

        // 💾 மெமரியில் சேமிக்கிறோம்
        storedInterviewContext = resumeInfo;

        // --- 🔴 இங்கிருந்து பதில் அனுப்புவதற்கு முன் தாமதத்தை சேர்க்கிறோம் ---
        console.log("⏳ Processing data... Please wait.");
        
        await delay(5000); // 2 வினாடிகள் தாமதம்

        console.log("✅ Sync complete. Sending response to UI...");
        console.log("==============================================\n");

        return res.status(200).json({
            success: true,
            message: "Backend received everything!",
        });

    } catch (error) {
        console.error("❌ Backend Store Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



//this is for send interview chat to lm model and get response to send ui 



/// this is for start to mock interview resume get functjionla erunthu start aguthu 







exports.getresumesformock = async (req, res) => {
  try {
    // 🔴 1. JWT-லிருந்து யூசர் ஐடி எடுக்கிறோம்
    const userId = req.user.id; 

    console.log(`--- Fetching Resumes for User ID: ${userId} ---`);

    // 🔴 2. SQL Query (userId அடிப்படையில் மட்டும்)
    const queryText = `
      SELECT title_id, title_name, html_codes, created_time 
      FROM user_all_resumes 
      WHERE user_id = $1 
      ORDER BY created_time DESC
    `;

    // 🔴 3. pool.query மூலம் டேட்டாவை எடுக்கிறோம்
    const result = await pool.query(queryText, [userId]);

    // 🔴 4. Backend Console Logging (HTML தவிர்த்து மற்றவை)
    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} resumes for user: ${userId}`);
      
      // கன்சோலில் டேபிள் வடிவில் காட்ட (HTML code நீக்கிவிட்டு)
      const tableDisplay = result.rows.map(row => ({
        ID: row.title_id,
        Title: row.title_name,
        Date: row.created_time
      }));
      
      console.table(tableDisplay); // இது பேக்கெண்ட் டெர்மினலில் அழகாகத் தெரியும்
    } else {
      console.log(`⚠️ No resumes found for user ID: ${userId}`);
    }

    // 🔴 5. டேட்டாவை ஃப்ரண்ட்-எண்டிற்கு அனுப்புகிறோம்
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error("❌ Database Error in getresumesformock:", error.message);
    return res.status(500).json({
      message: "Internal Server Error while fetching resumes"
    });
  }
};






















