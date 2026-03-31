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





const [mockDetailsOpen, setMockDetailsOpen] = useState(false);
const [openProjectResume, setOpenProjectResume] = useState(false);
const [projectResumes, setProjectResumes] = useState([]); // ரெஸ்யூம் லிஸ்டை சேமிக்க
const [loading, setLoading] = useState(false); // லோடிங் ஸ்டேட்டஸ்
// 🔴 இதைச் சேர்க்கவில்லை என்றால் பக்கம் ஒர்க் ஆகாது
const [selectedTempResume, setSelectedTempResume] = useState(null);




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



























useEffect(() => {
  const handleEsc = (event) => {
    if (event.keyCode === 27) setMockDetailsOpen(false);
  };
  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, []);




// 1. State Setup (புதிய projectResume கீ சேர்க்கப்பட்டுள்ளது)
const [formData, setFormData] = useState({
  interviewType: 'Technical HR',
  domain: 'FullStack',
  skills: '',
  difficulty: '3',
  resume: null,        // கம்ப்யூட்டரில் இருந்து அப்லோட் செய்வது
  projectResume: null, // ப்ராஜெக்ட் லிஸ்டில் இருந்து எடுப்பது
  notes: ''
});

// 2. Form Reset Function
const resetForm = () => {
  setFormData({
    interviewType: 'Technical HR',
    domain: 'FullStack',
    skills: '',
    difficulty: '3',
    resume: null,
    projectResume: null,
    notes: ''
  });
  setMockDetailsOpen(false);
  setOpenProjectResume(false); // ப்ராஜெக்ட் ரெஸ்யூம் ஓவர்லே-யும் மூடப்படும்
};

// 3. Handle Change Function
const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  
  if (type === 'file') {
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

// 4. Validation & Navigation Logic
const handleStartInterview = () => {
  const { skills, resume, projectResume, notes } = formData;

  // 🔴 CONDITION A: இரண்டு வகையான ரெஸ்யூமையும் கொடுத்திருந்தால்
  if (resume && projectResume) {
    alert("Please select only ONE resume source (Computer OR Project)!");
    return;
  }

  // 🔴 CONDITION B: ரெஸ்யூம் (எந்த வகை என்றாலும்) + மேனுவல் ஸ்கில்ஸ் - ரெண்டையும் கொடுத்தால்
  if ((resume || projectResume) && skills.trim()) {
    alert("Resume detected! Please clear the 'Core Skills' field or remove the resume to proceed.");
    return;
  }

  // 🔴 CONDITION C: எதுவுமே கொடுக்கவில்லை என்றால்
  if (!resume && !projectResume && !skills.trim()) {
    alert("Please provide a resume OR enter your core skills!");
    return;
  }

  // 🔴 CONDITION D: ரெஸ்யூம் இல்லை என்றால் நோட்ஸ் கட்டாயம் (Notes Mandatory)
  if (!resume && !projectResume && !notes.trim()) {
    alert("Notes are mandatory if you are not providing a resume!");
    return;
  }

  // --- VALIDATION SUCCESS ---
  console.log("--- Validation Passed Successfully ✅ ---");
  console.log("Final Form Data:", formData);

  if (resume || projectResume) {
    const fileName = resume ? resume.name : projectResume.name;
    console.log(`Mode: Resume Interview (${fileName})`);
  } else {
    console.log("Mode: Manual Entry Interview");
  }

  // 🔴 Navigate to Screeninterview.jsx
  navigate("/interview-screen", { state: formData });
};





const getAllResumes = async () => {
  // 🔴 1. முதலில் பாப்-அப் ஓவர்லே-ஐத் திறக்கிறோம்
  setOpenProjectResume(true);
  
  // 🔴 2. லோடிங் காட்டுகிறோம்
  setLoading(true);
  
  try {
    // 🔴 3. ஏபிஐ கால் (உங்கள் எண்ட் பாயிண்ட்: /getresumeformock)
    const response = await API.get("/getresumeformock"); 
    
    // 🔴 4. டேட்டாவை ஸ்டேட்டில் சேமிக்கிறோம்
    setProjectResumes(response.data); 
    console.log("Resumes fetched successfully:", response.data);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    alert("Failed to load resumes. Please try again.");
    // ஒருவேளை எர்ரர் வந்தால், பாப்-அப் தானாகவே மூடிக்கொள்ள வேண்டும் என்றால்:
    setOpenProjectResume(false); 
  } finally {
    setLoading(false);
  }
};


const handleResumeClick = (resume) => {
  console.log("Temporarily Selected:", resume.title_name);
  setSelectedTempResume(resume); 
};

const confirmSelection = () => {
  if (selectedTempResume) {
    setFormData((prev) => ({
      ...prev,
      projectResume: selectedTempResume, // முழு டேட்டாவும் (html_codes உட்பட) இங்கே சேரும்
      resume: null, // கம்ப்யூட்டர் அப்லோடு இருந்தால் அதை நீக்கிவிடுவோம்
      skills: ''    // ரெஸ்யூம் இருப்பதால் மேனுவல் ஸ்கில்ஸை காலியாக்குகிறோம்
    }));
    
    setOpenProjectResume(false); // பாப்-அப் மூடுகிறோம்
    console.log("Finalized Resume Selection:", selectedTempResume.title_name);
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
         {/* <button onClick={() => navigate("/interview-screen")}>
         go to  interview 
      </button> */}
      <button onClick={() => setMockDetailsOpen(true)}>
        Go to Interview
      </button>
     
 </div>




    



      </div>
{mockDetailsOpen && (
  <div 
   className="overlay-interview"
   onClick={resetForm} இங்கே கிளிக் செய்தால் மூடும்
  >
    <div 
      className="mock-modal" 
      onClick={(e) => e.stopPropagation()} // 🔴 உள்ளே கிளிக் செய்தால் மூடுவதைத் தடுக்கும்
    >
      <h2>Mock Interview Setup</h2>
      <p>Enter your details below to start the session.</p>




<div className="form-content">
  {/* 1. Interview Type */}
  <div className="input-group">
    <label>Interview Type</label>
    <select 
      name="interviewType" 
      value={formData.interviewType} 
      onChange={handleChange}
    >
      <option value="Technical HR">Technical HR (Coding & Concepts)</option>
      <option value="Behavioral HR">Behavioral HR (Personality)</option>
      <option value="Managerial Round">Managerial Round (Projects & Experience)</option>
    </select>
  </div>

  {/* 2. Domain Selection */}
  <div className="input-group">
    <label>Target Domain</label>
    <select 
      name="domain" 
      value={formData.domain} 
      onChange={handleChange}
    >
      <option value="Frontend">Frontend Development</option>
      <option value="Backend">Backend Development</option>
      <option value="FullStack">Full Stack (MERN)</option>
    </select>
  </div>

  {/* 3. Tech Skills Input */}
  <div className="input-group">
    <label>Core Skills</label>
    <input 
      type="text" 
      name="skills"
      placeholder="Ex: React, Node.js, MongoDB" 
      value={formData.skills}
      onChange={handleChange}
    />
  </div>

  {/* 4. Difficulty Level (Volume/Slider UI) */}
  <div className="input-group">
    <label>Difficulty Level: {formData.difficulty}</label>
    <input 
      type="range" 
      name="difficulty"
      min="1" 
      max="5" 
      step="1" 
      className="level-slider"
      value={formData.difficulty}
      onChange={handleChange}
    />
    <div className="level-labels">
      <span>Easy</span>
      <span>Medium</span>
      <span>Hard</span>
    </div>
  </div>

  {/* 5. Resume Upload */}
  <div className="input-group">
    <label>Upload Resume (Optional)</label>
    <div className="file-upload">
      <input 
        type="file" 
        id="resume" 
        name="resume"
        accept=".pdf"
        hidden 
        onChange={handleChange}
      />
      <label htmlFor="resume" className="upload-label">
        {formData.resume ? `✅ ${formData.resume.name}` : "📁 Choose Resume (PDF)"}
      </label>
    </div>
  </div>


  {/* 5.2. Project Saved Resume (New) */}
<div className="input-group">
  <label>Or Choose From Project</label>
  <div 
    className="project-resume-btn" 
    onClick={getAllResumes}
    style={{
      border: formData.projectResume ? "2px solid #28a745" : "1px dashed #007bff",
      backgroundColor: formData.projectResume ? "#f0fff4" : "transparent"
    }}
  >
    {/* 🔴 இங்கேதான் கண்டிஷன் போடுகிறோம் */}
    {formData.projectResume ? (
      <>✅ Selected: <strong>{formData.projectResume.title_name}</strong></>
    ) : (
      <>📂 Select From My Projects</>
    )}
  </div>
</div>

  {/* 6. Extra Notes */}
  <div className="input-group">
    <label>Additional Instructions</label>
    <textarea 
      name="notes"
      placeholder="Anything else the AI should know?" 
      rows="2"
      value={formData.notes}
      onChange={handleChange}
    ></textarea>
  </div>
  
</div>




      <div className="modal-buttons">
        <button className="start-btn" onClick={handleStartInterview}>
    Start Interview
  </button>
        <button className="close-btn" onClick={resetForm}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}







{openProjectResume && (
  <div className="all-project-resume-overlay" onClick={() => setOpenProjectResume(false)}>
    {/* ஒரே ஒரு மெயின் மோடல் டிவ் மட்டும் போதும் */}
    <div className="all-project-resume-modal" onClick={(e) => e.stopPropagation()}>
      
      <div className="modal-header">
        <h3>My Saved Resumes</h3>
        <button className="close-x" onClick={() => setOpenProjectResume(false)}>×</button>
      </div>
      
      <div className="resume-list-container">
        {loading ? (
          <p className="loading-text">Fetching your resumes from project...</p>
        ) : projectResumes.length > 0 ? (
          projectResumes.map((res) => (
            <div 
              key={res.title_id} 
              className={`resume-item-card ${selectedTempResume?.title_id === res.title_id ? 'active' : ''}`}
              onClick={() => handleResumeClick(res)}
            >
              <span>📄 {res.title_name}</span>
              {selectedTempResume?.title_id === res.title_id && <span className="check-mark">✅</span>}
            </div>
          ))
        ) : (
          <p className="no-data-text">No saved resumes found.</p>
        )}
      </div>

      {/* 🔴 Confirm Selection Button Section */}
      <div className="modal-footer" style={{ textAlign: 'right', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <button 
          className="confirm-btn" 
          onClick={confirmSelection}
          disabled={!selectedTempResume}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedTempResume ? '#007bff' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: selectedTempResume ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          Confirm Selection
        </button>
      </div>
      
    </div>
  </div>
)}











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
