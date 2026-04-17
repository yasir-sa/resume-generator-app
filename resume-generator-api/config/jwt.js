// const jwt = require("jsonwebtoken");




// exports.verifyToken =(req,res,next)=>{
//     try{
//         const token =req.cookies.token;
//         if(!token){
//             return res.status(401).json({
//                message:"Token illa please login first"
//             });        }
//             const decoded= jwt.verify(token,process.env.JWT_SECRET)
//             req.user = decoded;
//             next();

//     }
//      catch (error) {
//     console.error("JWT verification error:", error);
//     return res.status(401).json({
//       message: "Invalid or expired token ❌"
//     });
//   }
    
// }


const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    try {
        // 1. Headers-ல் இருந்து டோக்கனை எடுக்கிறோம் (Bearer [token])
        const authHeader = req.headers.authorization || req.headers.Authorization;

        // ஒருவேளை நீங்கள் இன்னும் Cookies பயன்படுத்துவதாக இருந்தால் இதையும் சேர்த்துக் கொள்ளலாம்
        let token = req.cookies?.token; 

        // Headers-ல் டோக்கன் இருந்தால் அதைப் பிரித்தெடுக்கிறோம்
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            console.log("Error: No Token Found in Header or Cookie");
            return res.status(401).json({
                message: "Token illa please login first"
            });
        }

        // 2. டோக்கனைச் சரிபார்க்கிறோம்
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 👈 இதுதான் Controller-க்கு User ID-ஐக் கொண்டு செல்லும்
        next();

    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({
            message: "Invalid or expired token ❌"
        });
    }
};