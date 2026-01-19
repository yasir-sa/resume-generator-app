const jwt = require("jsonwebtoken");




exports.verifyToken =(req,res,next)=>{
    try{
        const token =req.cookies.token;
        if(!token){
            return res.status(401).json({
               message:"Token illa please login first"
            });        }
            const decoded= jwt.verify(token,process.env.JWT_SECRET)
            req.user = decoded;
            next();

    }
     catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      message: "Invalid or expired token ❌"
    });
  }
    
}