import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js"
import { FaPlus } from "react-icons/fa"; 
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
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








const previewRef = useRef(null);   // iframe preview
const downloadRef = useRef(null); // hidden download
// Product.jsx உள்ளே மற்ற ஸ்டேட்களுக்கு கீழே இதைச் சேர்க்கவும்
const [appliedJobs, setAppliedJobs] = useState([]);
const [jobsLoading, setJobsLoading] = useState(false);

// possible values: "view" | "edit" | "delete"











const fetchAppliedJobs = async () => {
    setJobsLoading(true);
    try {
        const response = await API.get("/user-applications"); // உங்கள் API endpoint
        setAppliedJobs(response.data);
    } catch (error) {
        console.error("Error fetching applied jobs:", error);
    } finally {
        setJobsLoading(false);
    }
};

// பக்கம் லோட் ஆகும் போது இதை அழைக்க useEffect
useEffect(() => {
    fetchAppliedJobs();
}, []);

























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















// const resumedownload = async () => {
//   const pdf = new jsPDF("p", "mm", "a4");

//   // ⏳ wait for DOM render
//   await new Promise(resolve => setTimeout(resolve, 800));

//   const pages = downloadRef.current.querySelectorAll(".resume-page");

//   for (let i = 0; i < pages.length; i++) {
//     const page = pages[i];

//     const canvas = await html2canvas(page, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       windowWidth: page.scrollWidth,
//       windowHeight: page.scrollHeight
//     });

//     const imgData = canvas.toDataURL("image/png");

//     const imgWidth = 210;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     if (i !== 0) pdf.addPage();

//     pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
//   }

//   pdf.save("My_Resume.pdf");
// };
const resumedownload = async () => {
  try {
    const res = await API.post(
      "/download-pdf",
      { htmlPages: resumePages },
      { responseType: "blob" }
    );

    // 🔥 IMPORTANT FIX
    const blob = new Blob([res.data], { type: "application/pdf" });

    // ❗ sometimes needed (force correct type)
    if (blob.size === 0) {
      alert("PDF is empty ❌");
      return;
    }

    const url = window.URL.createObjectURL(blob);

    // ✅ SAFE DOWNLOAD METHOD
    const link = document.createElement("a");
    link.href = url;
    link.download = "My_Resume.pdf";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);

  } catch (err) {
    console.error("Download error:", err);
  }
};
// const buildFullHTML = () => {
//   return `
//     <html>
//       <head>
//         <meta charset="UTF-8" />

//         <style>
//           body {
//             margin: 0;
//             padding: 0;
//             background: #ffffff;
//           }

//           /* A4 exact */
//           .resume-page {
//             width: 794px;
//             min-height: 1123px;
//             background: #ffffff !important;
//             color: #000000 !important;
//             page-break-after: always;
//           }

//           /* remove unwanted spacing */
//           p, h1, h2, h3, h4, h5, h6 {
//             margin: 0;
//           }
//         </style>
//       </head>

//       <body>
//         ${resumePages.join("")}
//       </body>
//     </html>
//   `;
// };















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

const handleStartInterview = () => {
  // 1. டேட்டாவை எடுக்கிறோம்
  const skills = formData.skills || "";
  const resume = formData.resume;
  const projectResume = formData.projectResume;
  const notes = formData.notes || "";

  // 2. Boolean செக் (டேட்டா இருக்கிறதா இல்லையா?)
  const hasComputerResume = !!resume; 
  const hasProjectResume = !!projectResume; 
  const hasSkills = skills.trim().length > 0;
  const hasNotes = notes.trim().length > 0;

  console.log("Validation Status:", { hasComputerResume, hasProjectResume, hasSkills });

  // --- 🔴 CONDITION 1: மூன்றுமே (All 3) இருந்தால் ---
  if (hasComputerResume && hasProjectResume && hasSkills) {
    alert("❌ Error: You have filled everything! Please provide only ONE: Upload Resume, Select Project, OR Type Skills.");
    return;
  }

  // --- 🔴 CONDITION 2: இரண்டு வகையான ரெஸ்யூமும் இருந்தால் (இதுதான் உங்கள் மெயின் பிரச்சனை) ---
  if (hasComputerResume && hasProjectResume) {
    alert("❌ Please select only ONE resume source: Either Computer Upload OR Project Selection!");
    return;
  }

  // --- 🔴 CONDITION 3: ரெஸ்யூம் + ஸ்கில்ஸ் இரண்டும் இருந்தால் ---
  if ((hasComputerResume || hasProjectResume) && hasSkills) {
    alert("❌ Resume detected! Please clear the 'Core Skills' field or remove the resume to proceed.");
    return;
  }

  // --- 🔴 CONDITION 4: எதுவுமே கொடுக்கவில்லை என்றால் ---
  if (!hasComputerResume && !hasProjectResume && !hasSkills) {
    alert("⚠️ Action Required: Please provide a resume OR enter your core skills!");
    return;
  }

  // --- 🔴 CONDITION 5: ரெஸ்யூம் இல்லாதபோது நோட்ஸ் கட்டாயம் ---
  if (!hasComputerResume && !hasProjectResume && !hasNotes) {
    alert("📝 Notes are mandatory if you are not providing a resume!");
    return;
  }

  // --- ✅ எல்லா செக்கிலும் பாஸ் ஆகிவிட்டது ---
  console.log("--- Validation Passed ✅ ---");
  
  // அடுத்த ஸ்கிரீனுக்கு அனுப்புகிறோம்
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
      // resume: null, // கம்ப்யூட்டர் அப்லோடு இருந்தால் அதை நீக்கிவிடுவோம்
      // skills: ''    // ரெஸ்யூம் இருப்பதால் மேனுவல் ஸ்கில்ஸை காலியாக்குகிறோம்
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
<div className="flex gap-4 p-4 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x md:flex-col md:overflow-y-auto md:max-h-[70vh] custom-scrollbar">
  {FullTitleName.map((title) => (
    <div 
      key={title.titleId} 
      onClick={() => openpreviewtitle(title.titleId)}
      className={`min-w-[220px] max-w-[220px] md:min-w-full snap-center flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer shadow-sm relative
        ${previewid === title.titleId 
          ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' 
          : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'}`}
    >
      
      {/* Title / Input Section */}
      <div className="flex-1 mb-3">
        {editId === title.titleId ? (
          <input
            autoFocus
            className="w-full px-3 py-2 border-2 border-blue-400 rounded-xl outline-none focus:ring-4 ring-blue-100 font-semibold text-gray-700 transition-all"
            value={changetitle}
            onChange={(e) => setchangetitle(e.target.value)}
            onClick={(e) => e.stopPropagation()} 
          />
        ) : (
          <span className={`text-base font-bold block truncate leading-relaxed ${previewid === title.titleId ? 'text-blue-700' : 'text-gray-800'}`}>
            {title.titleName}
          </span>
        )}
      </div>

      {/* Buttons Section */}
      <div className="flex items-center gap-2 mt-2">
        {editId === title.titleId ? (
          <div className="flex gap-2 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); newtitlesave(title.titleId); }}
              className="flex-1 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
              Ok
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); canceledit(); }}
              className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : deleteId === title.titleId ? (
          <div className="flex gap-2 w-full">
            <button 
              onClick={(e) => { e.stopPropagation(); confirmDelete(title.titleId); }}
              className="flex-1 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-lg animate-pulse hover:brightness-110 active:scale-95 transition-all shadow-sm"
            >
              Confirm
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); cancelDelete(); }}
              className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); edittitleopen(title.titleId); }}
              className="text-xs font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-70 transition-all"
            >
              Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deletetitleopen(title.titleId); }}
              className="text-xs font-extrabold uppercase tracking-wider text-red-500 hover:text-red-700 transition-all"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Active Indicator Dot */}
      {previewid === title.titleId && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  ))}
</div>





 </div>
 
 
 <div className="other-features-section">
 
  <Link to="/chatbox">
    <button >go to chatpot</button>
    </Link>
    <Link to="/completed-mocks">
       <button 
 >
  Go to Completed Mock Interviews
</button>
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

      <Link to="/apply-jobs">
    <button >go to jop page</button>
    </Link>
    
<div className="applied-jobs-section" style={{ marginTop: '30px', padding: '20px' }}>
    <h2 style={{ marginBottom: '15px', color: '#333' }}>Applied Job Tracker 🚀</h2>
    
    {jobsLoading ? (
        <p>Loading your applications...</p>
    ) : appliedJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {appliedJobs.map((job) => (
                <div key={job.id} style={{
                    background: '#fff',
                    padding: '15px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderLeft: `6px solid ${job.portal === 'AI Engine' ? '#9333ea' : '#f97316'}`
                }}>
                    <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{job.jobName}</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>🏢 {job.company}</p>
                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>📍 {job.location}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{
                            fontSize: '10px',
                            background: '#f0f0f0',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontWeight: 'bold'
                        }}>
                            {job.portal}
                        </span>
                        <span style={{ fontSize: '10px', color: '#999' }}>
                            {new Date(job.appliedTime).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '15px' }}>
            <p>No jobs applied yet. Go to Job Page to start! 🔍</p>
        </div>
    )}
</div>

     
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










{/* 
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
)} */}
{previewid !== null && (
  <div className="resume-preview-page">

    {/* ✅ Preview மட்டும் iframe */}
    <div className="resume-container">
      {resumePages.map((page, index) => (
        <iframe
          key={index}
          className="resume-iframe"
          srcDoc={page}
          title={`resume-${index}`}
        />
      ))}
    </div>

    <button
      onClick={() => setpreviewid(null)}
      className="go-back-btn"
    >
      go back
    </button>

    <button onClick={resumedownload} className="download-btn">
      download your resume
    </button>

  </div>
)}


{/* ✅ DOWNLOAD மட்டும் hidden clean container */}
<div
  ref={downloadRef}
  style={{
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    width: "794px",
    background: "#ffffff"
  }}
>
  {resumePages.map((page, index) => (
    <div
      key={index}
      className="resume-page"
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        color: "#000",
        overflow: "hidden"
      }}
      dangerouslySetInnerHTML={{ __html: page }}
    />
  ))}
</div>











    </div>
  );
};

export default Product;
