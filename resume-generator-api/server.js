const express=require("express")
const app= express()



app.use(express.json());


app.get("/",(req,res)=>{
    res.send("hello from resume generator API")
});


const PORT =5000;
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)
});