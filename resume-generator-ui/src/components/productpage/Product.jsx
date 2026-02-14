import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js"
import { FaPlus } from "react-icons/fa"; 
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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




  const [FullTitleName, setFullTitleName] = useState([]);
  // const [edittitle,setedittitle]=useState(false);
  // const [deletetitle,setdeletetitle]=useState(false);
 const [changetitle,setchangetitle]=useState("")
// const [mode, setMode] = useState("view");
const [editId, setEditId] = useState(null);
const [deleteId, setDeleteId] = useState(null);
const [previewid,setpreviewid]=useState(null)
const [resumePages, setResumePages] = useState([]);
const resumeRef = useRef(null);



// possible values: "view" | "edit" | "delete"


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




const getAlltitles =async()=>{
 
 try{
      const response = await API.get("/getall-titles")
      setFullTitleName(
  response.data.map((item) => ({
    titleId: item.title_id,
    titleName: item.title_name
  }))
);
 }
 catch(error){
  console.error("resume titles get error :",error)
 }
}

useEffect(()=>{
  getAlltitles();
},[]);


const edittitleopen = (id) => {
  setDeleteId(null); // close delete if open
  setEditId(id);

  const selected = FullTitleName.find(t => t.titleId === id);
  if (selected) {
    setchangetitle(selected.titleName);
  }
};

const deletetitleopen = (id) => {
  setEditId(null); // close edit if open
  setDeleteId(id);
};


const canceledit = () => {
  setEditId(null);
  setchangetitle("");
};

const newtitlesave = async (id) => {
  try {
    await API.put("/update-resume-title", {
      titleId: id,
      titleName: changetitle
    });

    await getAlltitles();

    setEditId(null);     // ✅ close edit mode
    setchangetitle("");  // clear input

  } catch (error) {
    console.error("Update error:", error);
  }
};


const confirmDelete = async (id) => {
  try {
    await API.delete(`/delete-resume-title/${id}`);

    await getAlltitles();

    setDeleteId(null); // close delete mode

  } catch (error) {
    console.error("Delete error:", error);
  }
};


const cancelDelete = () => {
  setDeleteId(null);
};

const openpreviewtitle=(id)=>{
     setpreviewid(id);
}




useEffect(() => {
  // if preview not selected → do nothing
  if (!previewid) return;

  const getresumehtml = async () => {
    try {
      const res = await API.get(`/get-resume-html/${previewid}`);

      console.log("Resume Html response:", res.data);

      // ✅ get html string from backend
      let htmlString = res.data?.html || "";

      // ✅ split multiple pages
      const pages = htmlString.split("<!-- PAGE BREAK -->");

      // ✅ store into state
      setResumePages(pages);

    } catch (err) {
      console.error("Resume fetch error:", err);
    }
  };

  getresumehtml();

}, [previewid]);










const resumedownload = async () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const pages = resumeRef.current.querySelectorAll(".resume-page");

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // convert page → canvas
    const canvas = await html2canvas(page, {
      scale: 2,          // high quality
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const imgWidth = 210; // A4 width mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i !== 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  }

  pdf.save("My_Resume.pdf");
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
  
      <div className="body-container">
 
 <div className="resume-create-section">

     <Link to="/resume-creator" className="resume-create-button">
    <button >
      <FaPlus size={20} color="green" />
      go to resume creator page 
      </button>
    </Link>
<div className="resume-titeles">
  {FullTitleName.map((title) => (
    <div className="title-one" key={title.titleId} onClick={()=>openpreviewtitle(title.titleId)}>

      {/* Title or Input */}
      {editId === title.titleId ? (
        <input
          value={changetitle}
          onChange={(e) => setchangetitle(e.target.value)}
        />
      ) : (
        <span>{title.titleName}</span>
      )}

 {/* Buttons */}
<div className="btn-container-title">
  {editId === title.titleId ? (
    <>
      <button onClick={(e) => { e.stopPropagation(); newtitlesave(title.titleId); }}>Ok</button>
      <button onClick={(e) => { e.stopPropagation(); canceledit(); }}>Cancel</button>
    </>
  ) : deleteId === title.titleId ? (
    <>
      <button onClick={(e) => { e.stopPropagation(); confirmDelete(title.titleId); }}>Confirm</button>
      <button onClick={(e) => { e.stopPropagation(); cancelDelete(); }}>Cancel</button>
    </>
  ) : (
    <>
      <button onClick={(e) => { e.stopPropagation(); edittitleopen(title.titleId); }}>Edit</button>
      <button onClick={(e) => { e.stopPropagation(); deletetitleopen(title.titleId); }}>Delete</button>
    </>
  )}
</div>



    </div>
  ))}
</div>



 </div>
 
 
 <div className="other-features-section">
 
  <Link to="/chatbox">
    <button >go to chatpot</button>
    </Link>
      <Link to="/">
    <button >go to home</button>
    </Link>
     
 </div>




    



      </div>
{previewid !== null &&(
        <div className="resume-preview-page">
          <div className="resume-container"ref={resumeRef}>
  {resumePages.map((page, index) => (
    <div
      key={index}
      className="resume-page"
      dangerouslySetInnerHTML={{ __html: page }}
    />
  ))}
</div>


             <button
  onClick={() => setpreviewid(null)}
  className="go-back-btn"
>
  go back
</button>

              <button onClick={resumedownload} className="download-btn">download your resume</button>
        </div>
)}
      


    </div>
  );
};

export default Product;
