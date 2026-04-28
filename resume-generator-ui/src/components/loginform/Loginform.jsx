import React from 'react'
import "./loginform.css"
import { useState } from 'react'
import API from "../../api.js";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {FcGoogle} from "react-icons/fc";







const Loginform = () => {
 
    const navigate=useNavigate()

   

const [formdata,setformdata]=useState({
    email:"",
    password:"",
})


const handlelogin = async(e) =>{

    e.preventDefault();

try{
   const response = await API.post("/login",{
    email:formdata.email,
    password:formdata.password,
   });

   console.log("Login success:", response.data);
    alert(response.data.message);
    navigate("/product")
}
catch(error){
    console.error("Login error:", error.response?.data || error.message);

    // show backend message in alert
    alert(error.response?.data?.message || error.message);
}






}



// const Googlelogin =()=>{
//     window.location.href = "http://localhost:5000/api/auth/google";
// }
const Googlelogin = () => {
    // தற்போது நீங்கள் எந்த URL-ல் இருக்கிறீர்களோ அதையே இது எடுக்கும்
    const currentOrigin = window.location.origin; 
    
    // லோக்கலில் இருந்தால் 5000 போர்ட்டுக்கும், ரெண்டரில் இருந்தால் அதே URL-க்கும் அனுப்பும்
    const backendUrl = currentOrigin.includes("localhost") 
        ? "http://localhost:5000" 
        : currentOrigin;

    window.location.href = `${backendUrl}/api/auth/google`;
}






  return (
      <>
      <div className="login-form" >

          <form action="" className='login-container' onSubmit={handlelogin}>
        <label className='email-label'>
           <input
            type="email" 
            placeholder='type email'
            name='email'
            value={formdata.email}
            onChange={(e)=> 
                setformdata({
                    ...formdata,
                    email:e.target.value
                })
            }
            />
        </label>
          <label className='password-label'>
           <input
            type="password" 
            placeholder='type password'
            name='password'
            value={formdata.password}
            onChange={(e)=> 
                setformdata({
                    ...formdata,
                    password:e.target.value
                })}
               />
              </label>

        <button className='login-btn'type="submit">
        login
        </button>

        <a><Link to="/register">go to register </Link></a>

<button
  type="button"
  className="google-login-btn"
  onClick={Googlelogin}
>
  <FcGoogle size={20}/> continue with google
</button>
<button onClick={() => window.location.href = "http://localhost:5000/auth/google"}>
  Login with Google
</button>



      </form>
      
      </div>
    
      
      </>
  )
}

export default Loginform