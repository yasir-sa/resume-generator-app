import React from "react";
import "./Register.css"
import { useState } from "react";
import API from "../api.js";




const Register = () => {

    const [confirmotp,setconfirmotp]=useState(false)
    const [formdata,setformdata]=useState({
        name:"",
        email:"",
        password:""

    })
    const [otpdata,setotpdata]=useState("")


    const registeration =async(e)=>{
        e.preventDefault();
        if(!formdata.name|| !formdata.email|| !formdata.password){
            alert("please fill all fields")
            return;
     
        }
      
        try{
            const res= await API.post("/api/register", formdata)
            console.log(res.data);
            setconfirmotp(true)
        }
        catch(error){
            console.error(err);
        }

     }
    const otpdetails =()=>{
        setconfirmotp(false)
    }
  
  
    return (
   <>
     <div className="register-container">

        <form className="register-form">
    <label>
        Name: <input 
        type="text" 
        value={formdata.name}
        onChange={(e)=>{
            setformdata({
                ...formdata,
                name:e.target.value
            })
        }}
        
        />
    </label>
    <label>
        Email: 
        <input 
      type="email" 
      value={formdata.email}
      onChange={(e) => setformdata({...formdata, email: e.target.value})}
    />
    </label>
    <label>
        password: 
        <input 
      type="password" 
      value={formdata.password}
      onChange={(e) => setformdata({...formdata, password: e.target.value})}
    />
    </label>
{confirmotp ? 
<div className="otp-container">
   <input type="number"
   value={otpdata}
   onChange={(e)=>setotpdata(e.target.value)} />
   <button className="confirm-otp-btn" onClick={otpdetails}>Confirm</button>
</div>:
 <button 
 type="submit" 
 className="register-btn" 
 onClick={registeration}>
    Register</button> }
 
   
        </form>

     </div>
      
   
   </>
  );
};

export default Register;
