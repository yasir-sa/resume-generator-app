const express=require("express")
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");


const app= express()
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());
const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("/helo",(req,res)=>{
    res.send("hello from resume generator API")
});



app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)
});