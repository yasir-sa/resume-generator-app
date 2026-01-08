import React from 'react'
import "./loginform.css"
import { useState } from 'react'
import API from "../../api.js";






const Loginform = () => {

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
   alert("login successful ")
}
catch(error){
   console.error("Login error:", error.response?.data || error.message);
}






}







  return (
      <>
      <div className="login-form" >

          <form action="" className='login-container'>
        <label className='email-label'>
           <input
            type="email" 
            placeholder='type email'
            name='email'
            value={FormData.email}
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
            value={FormData.password}
            onChange={(e)=> 
                setformdata({
                    ...formdata,
                    password:e.target.value
                })}
               />
              </label>

        <button className='login-btn' onClick={handlelogin}>
        login
        </button>

        <a>go to register </a>


      </form>
      
      </div>
    
      
      </>
  )
}

export default Loginform