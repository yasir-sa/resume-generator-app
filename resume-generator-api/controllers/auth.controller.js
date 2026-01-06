



const register =(req,res)=>{
     console.log("📥 UI la irundhu vandha data:");
  console.log(req.body); 

  res.status(200).json({
    success: true,
    message: "Register API reached backend"
  });
}
module.exports={register};