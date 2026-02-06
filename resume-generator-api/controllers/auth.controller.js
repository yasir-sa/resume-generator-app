const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sendOTPEmail =require("../utils/email");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const multer = require("multer");
require("dotenv").config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
 
// const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));













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
exports.submitResume = async (req, res) => {
  try {
    let { pagecount, pageOne, pageTwo, pageThree, photoChunks } = req.body;

    pagecount = Number(pagecount || 1);

    // 🟢 Join Base64 photo
    let photoBase64 = "";
    if (Array.isArray(photoChunks)) {
      photoBase64 = photoChunks.join("");
    }

    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    // 🟢 PROFESSIONAL PROMPT BUILDER (page wise)
    const buildPrompt = (pageNum, pageData) => `
Create ONE single-page ATS-friendly professional resume in pure HTML.

STRICT RULES:
- Output must contain ONLY ONE <html> document
- Use ONLY the given data
- Do NOT repeat other pages data
- No gradient or background color for name
- Clean typography, professional spacing
- Profile photo must be square or rectangle (NOT round)

PROFILE PHOTO:
<img src="${photoBase64}" class="profile-photo" />

PAGE ${pageNum} DATA:
${JSON.stringify(pageData, null, 2)}
`;

    // 🟢 Dummy HTML (safe fallback)
    const dummyHTML = (pageNum, data, showPhoto) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Resume</title>

<style>
/* ===== RESET ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ===== BODY ===== */
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #222;
  margin: 40px;
  background: #fff;
}

/* ===== HEADER ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.name-title h1 {
  font-size: 28px;
  font-weight: bold;
  background: none !important;
  color: #000;
}

.name-title h2 {
  font-size: 16px;
  font-weight: normal;
  color: #555;
  margin-top: 4px;
}

/* ===== PHOTO ===== */
.profile-photo {
  width: 120px;
  height: auto;
  border: 1px solid #ccc;
}

/* ===== CONTACT ===== */
.contact {
  margin-top: 10px;
  font-size: 13px;
  color: #333;
}

.contact p {
  margin-bottom: 4px;
}

/* ===== SECTION ===== */
.section {
  margin-top: 22px;
}

.section h3 {
  font-size: 15px;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.section p {
  margin-bottom: 6px;
}

.section ul {
  padding-left: 18px;
}

.section li {
  margin-bottom: 4px;
}

/* ===== PRINT FIX ===== */
@media print {
  body {
    margin: 30px;
  }
  h1, h2, h3 {
    background: none !important;
  }
  * {
    -webkit-print-color-adjust: economy !important;
    print-color-adjust: economy !important;
  }
}
</style>
</head>

<body>

${pageNum === 1 ? `
<div class="header">
  <div class="name-title">
    <h1>${data.fullName || "Your Name"}</h1>
    <h2>${data.jobTitle || "Job Title"}</h2>

    <div class="contact">
      <p>Email: ${data.email || "-"}</p>
      <p>Phone: ${data.phoneNumber || "-"}</p>
      <p>Address: ${data.address || "-"}</p>
    </div>
  </div>

  ${showPhoto && data ? `<img src="${photoBase64}" class="profile-photo" />` : ""}
</div>

<div class="section">
  <h3>Professional Summary</h3>
  <p>${data.summary || "Professional summary not provided."}</p>
</div>

<div class="section">
  <h3>Skills</h3>
  <ul>
    ${(data.skill || "")
      .split(",")
      .map(s => `<li>${s.trim()}</li>`)
      .join("")}
  </ul>
</div>
` : ""}

${pageNum === 2 ? `
<div class="section">
  <h3>Experience</h3>
  <p>${data.experience || "Experience details not provided."}</p>
</div>

<div class="section">
  <h3>Projects</h3>
  <p>${data.projects || "Project details not provided."}</p>
</div>

<div class="section">
  <h3>Certifications</h3>
  <p>${data.certifications || "No certifications available."}</p>
</div>
` : ""}

${pageNum === 3 ? `
<div class="section">
  <h3>Languages</h3>
  <p>${data.languages || "-"}</p>
</div>

<div class="section">
  <h3>Achievements</h3>
  <p>${data.achievements || "-"}</p>
</div>

<div class="section">
  <h3>Interests</h3>
  <p>${data.interests || "-"}</p>
</div>
` : ""}

</body>
</html>
`;


    let finalHTML = "";

    // 🔵 LOOP PAGE BY PAGE
    for (let i = 1; i <= pagecount; i++) {
      const pageData =
        i === 1 ? pageOne :
        i === 2 ? pageTwo :
        pageThree;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: buildPrompt(i, pageData) }] }
              ]
            })
          }
        );

        if (!response.ok) throw new Error("Gemini failed");

        const data = await response.json();
        const html = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!html.includes("<html")) throw new Error("Invalid HTML");

        console.log(`✅ Gemini page ${i} OK`);
        finalHTML += html;

      } catch (err) {
        console.warn(`⚠️ Gemini failed page ${i}, using dummy`);
        finalHTML += dummyHTML(i, pageData, i === 1);
      }
    }

    // 🟢 FINAL RESPONSE
    res.json({
      success: true,
      html: finalHTML
    });

  } catch (err) {
    console.error("submitResume error:", err);
    res.status(500).json({ error: "Resume generation failed" });
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
