import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js"
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
const Product = () => {
  const navigate = useNavigate();
  const [profile,setprofile]=useState(false)
  const [user,setuser]=useState({
  id: null,
  name: "",
  email: "",
  picture: "",
  provider:""
})
const [openpassword, setopenpassword] = useState(false);
const [needPassword, setNeedPassword] = useState(false);
const [newPassword, setNewPassword] = useState("");

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
  
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");

      setuser({
        id: res.data.userId,
        name: res.data.name,
        email: res.data.email,
        picture: res.data.picture,
        provider: res.data.provider
      });

      // 🔥 backend flag directly use pannrom
      setNeedPassword(res.data.needPassword);

    } catch (err) {
      console.error("profile fetch error", err);
    }
  };

  fetchProfile();
}, []);




const sendpasswordbtn=()=>{
  alert("hi pro now sdtart")
  setopenpassword(true)
}


const sendpasword = async () => {
  if (!newPassword.trim()) {
    alert("Please enter a password");
    return;
  }

  try {
    const res = await API.post("/user/set-password", {
      password: newPassword
    });

    alert(res.data.message); // success message
    setNewPassword("");       // clear input
    setopenpassword(false);   // close input
  } catch (err) {
    console.error("Error setting password:", err);
    alert("Failed to set password");
  }
};

  return (
    <div className="product-page" onClick={()=> setprofile(false)}>
         
    <nav className="main-page-header">
      <h1 className="main-title">
       <p className="box-ai">AI</p> Ai Career Analyzer
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
          <p className="provider-name">{user.provider}</p>
        
         {needPassword &&(
  <button className="change-password-btn" onClick={sendpasswordbtn}>
   set password Please
  </button>
)}

{openpassword &&(
  <div className="password-input-container">
           <input
      type="password"
      placeholder="Enter new password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
         <button className="send-password-btn" onClick={sendpasword}>save</button>
  </div>
)}
           <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

       </div>}
     

    </nav>
    <Link to="/chatbox">
    <button >go to chatpot</button>
    </Link>
      <Link to="/">
    <button >go to home</button>
    </Link>
      <Link to="/resume-creator">
    <button >go to resume creator page </button>
    </Link>
    
      
    </div>
  );
};

export default Product;
