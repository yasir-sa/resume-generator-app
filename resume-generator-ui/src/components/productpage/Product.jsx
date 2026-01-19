import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js"
import { useState,useEffect } from "react";
const Product = () => {
  const navigate = useNavigate();
  const [profile,setprofile]=useState(false)
  const [user,setuser]=useState({
  id: null,
  name: "",
  email: "",
  picture: ""
})
  const handleLogout = async() => {
    // later: localStorage.removeItem("token");
   try {
      await API.post("/logout");
      navigate("/");
    } catch (error) {
      console.log("Logout error", error);
    }
  };


  const profileopen = (e) =>{
    e.preventDefault();
    e.stopPropagation();
  
    setprofile((prev)=> !prev)

  }
  

useEffect(()=>{
  const fetchProfile = async()=>{
    try{
      const res=await API.get("/user/profile");
       setuser({
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture
      });

    }
    catch(err){
      console.error("profile fetch error ", err)
    }
  }
  fetchProfile();
},[])





  return (
    <div className="product-page" onClick={()=> setprofile(false)}>

    <nav className="main-page-header">
      <h1 className="main-title">
        Ai Career Analyzer
      </h1>




      <div className="profile" onClick={profileopen}>
              {user.picture 
    ? <img src={user.picture} alt="Profile" className="profile-img" />
    : <div className="placeholder-icon">👤</div>
  }
      </div>
   {profile && 
       <div className="profile-page" onClick={(e)=>e.stopPropagation()}>

        
          <div className="profile-icon">
             {user.picture?
             <img src ={user.picture} className="profile-img1" />:<div className="placeholder-icon">👤</div>}
          </div>
             <label className="profile-name">Name:<span>{user.name}</span></label>

          <label className="email">Email:<span>{user.email}</span></label>
          
           <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

       </div>}
     

    </nav>
      
    </div>
  );
};

export default Product;
