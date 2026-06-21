import { useState, useRef, useEffect } from "react";
import "./resumedetails.css";
import API from "../../api";


const Resumedetails = () => {
 
  const [pagecount,setpagecount]=useState(1);
  const [PreviewPhoto,setPreviewPhoto]=useState(null)
   const [titleOpen, setTitleOpen] = useState(false); // to show/hide title input div
  const [titleName, setTitleName] = useState("");    // input value
  const [htmlCode, setHtmlCode] = useState("");      // your resume HTML content
  const titleRef = useRef();  
  const [previewPages, setPreviewPages] = useState([]);


  const [page1, setPage1] = useState({
  fullName: "",
  jobTitle: "",
  email: "yasirsa05@gmail.com",
  phoneNumber: "8270089089",
  address: "71/96 Kalvathunayagam street",
  summary: "Motivated and detail-oriented aspiring Full Stack Developer with a strong foundation in HTML, CSS, JavaScript, React, and backend fundamentals. Experienced in building responsive web applications, REST APIs, and real-world projects including resume generators and e-commerce layouts. Passionate about learning modern frameworks, writing clean code, and solving practical problems through technology.",
  photo:null,
  photoBase64: null, 
  skill:"react,node,express,python,postgrs,githup",
   
   linkedIn: "https://www.linkedin.com/in/yasir-sa",         // Example LinkedIn
  github: "https://github.com/yasirsa05",                  // Example GitHub
  education: "B.Tech in Computer Science, XYZ University, 2024",  // Example education
  languages: "English, Tamil, Hindi",                      // Example languages
  certifications: "ReactJS, NodeJS, FullStack Web Development Certificate", // Example certifications
});


const [page2, setPage2] = useState({
  experience:
    "Completed multiple academic and personal projects during my college studies, gaining hands-on experience in front-end and basic back-end development. Worked with HTML, CSS, JavaScript, and React to build responsive and user-friendly web applications. Familiar with version control using Git and collaborative project workflows.",

  projects:
    "E-commerce Web Application – Developed a responsive shopping platform with product listing, cart functionality, and user interface optimization.\n" +
    "To-Do List Application – Built a task management application with CRUD operations and clean UI for improved productivity.\n" +
    "AI Career Analyzer – Created a basic AI-driven tool to analyze user skills and suggest suitable career paths using structured logic.",

  certifications:
    "Currently pursuing skill development through self-learning and academic coursework. Actively enhancing knowledge in full-stack web development and modern JavaScript frameworks.",

  // ✅ Extra fields for Page 2
  achievements:
    "Recipient of 'Best Student Project Award' for E-commerce Web Application. Recognized for teamwork and contribution in collaborative coding projects.",

  volunteering:
    "Volunteered as a mentor for college coding club workshops, teaching HTML, CSS, and basic JavaScript to beginners.",

  awards:
    "Hackathon Winner – College-level hackathon on AI-based tools (2024).",

  notableProjects:
    "Developed a real-time chat application using Node.js and Socket.io for college community engagement.",

  publications:
    "Published a technical article on 'Introduction to React Hooks' in the college tech magazine."
});



const [page3, setPage3] = useState({
  languages:
    "English – Professional fluency\n" +
    "Tamil – Native\n" +
    "Hindi – Conversational",

  achievements:
    "Completed 'Full Stack Web Development Bootcamp' with distinction.\n" +
    "Winner of inter-college coding competition for innovative project ideas.\n" +
    "Maintains a GitHub portfolio with 10+ projects demonstrating web development skills.",

  interests:
    "Web development, Open-source contribution, AI & Machine Learning, Blogging about tech, Traveling and photography.",

  // ✅ Extra fields for Page 3
  softSkills:
    "Problem-solving, Critical thinking, Team collaboration, Communication, Time management.",

  hobbies:
    "Reading tech blogs, Playing chess, Exploring new web frameworks.",


  community:
    "Active member of local coding community, organizing workshops and hackathons."
});


const getPage1Error = () => {
  if (!page1.fullName) return "Full Name";
  if (!page1.jobTitle) return "Job Title";
  if (!page1.email) return "Email";
  if (!page1.phoneNumber) return "Phone Number";
  if (!page1.address) return "Address";
  if (!page1.skill) return "Skill";
  if (!page1.photo) return "Profile Photo";
  
   if (!page1.linkedIn) return "LinkedIn Profile";
  if (!page1.github) return "GitHub / Portfolio";
  if (!page1.education) return "Education";
  if (!page1.languages) return "Languages";
  if (!page1.certifications) return "Certifications";
  return null;
};


const getPage2Error = () => {
  if (!page2.experience) return "Experience";
  if (!page2.projects) return "Projects";
  if (!page2.certifications) return "Certifications";
  return null;
};


const getPage3Error = () => {
  if (!page3.languages) return "Languages";
  if (!page3.achievements) return "Achievements";
  if (!page3.interests) return "Interests";
  return null;
};



// const fileToBase64=(file)=>{
//     return new Promise((resolve,reject)=>{
//         const reader = new FileReader();
//            reader.readAsDataURL(file);
//            reader.onload = () => {
//       resolve(reader.result); // Base64 string
//     };
//        reader.onerror = (error) => {
//       reject(error);
//     };
//     });
// }




// const splitBase64 = (base64, chunkSize = 50000) => {
//   const chunks = [];
//   for (let i = 0; i < base64.length; i += chunkSize) {
//     chunks.push(base64.slice(i, i + chunkSize));
//   }
//   return chunks;
// };








  const splitHTMLPages = (htmlString) => {
  const pages = htmlString
    .split("</html>")
    .map(page => page.trim())
    .filter(page => page.length > 0)
    .map(page => page + "</html>");

  if (pages.length <= 1) return pages;

  // Page 1-ல் உள்ள CSS-ஐ மற்ற pages-க்கும் copy பண்ணும்
  const styleMatch = pages[0].match(/<style[\s\S]*?<\/style>/gi);
  const sharedStyles = styleMatch ? styleMatch.join("\n") : "";

  return pages.map((page, index) => {
    if (index === 0 || !sharedStyles) return page;
    if (page.includes("</head>")) {
      return page.replace("</head>", `${sharedStyles}\n</head>`);
    }
    return page;
  });
};








// const createresume =async (e) => {
//   e.preventDefault();

//   // PAGE 1 – always mandatory
//   const page1Error = getPage1Error();
//   if (page1Error) {
//     alert(`நீ ${pagecount} page select பண்ணியிருக்க.
// முதல் பக்கத்தில் "${page1Error}" நிரப்பவில்லை`);
//     return;
//   }

//   // PAGE 2 – only if pagecount >= 2
//   if (pagecount >= 2) {
//     const page2Error = getPage2Error();
//     if (page2Error) {
//       alert(`நீ ${pagecount} page select பண்ணியிருக்க.
// இரண்டாம் பக்கத்தில் "${page2Error}" நிரப்பவில்லை`);
//       return;
//     }
//   }

//   // PAGE 3 – only if pagecount === 3
//   if (pagecount >=3) {
//     const page3Error = getPage3Error();
//     if (page3Error) {
//       alert(`நீ  ${pagecount} page select பண்ணியிருக்க.
// மூன்றாம் பக்கத்தில் "${page3Error}" நிரப்பவில்லை`);
//       return;
//     }
//   }

//   // ✅ ALL GOOD
 
// try {
//   const photoChunks = page1.photoBase64 ? splitBase64(page1.photoBase64) : [];

// const response = await API.post("/resume-details", {
//   pagecount,
//   pageOne: page1,
//   pageTwo: page2,
//   pageThree: page3,
//   photoChunks // அனுப்பிறோம் small chunks
// });
//   const rawHtml = response.data.html;
//   const pagesArray = splitHTMLPages(rawHtml);
//   setPreviewPages(pagesArray);

//   alert("All details filled correctly ✅ Resume can be created");
// } catch (error) {
//   console.error(error);
//   alert("Something went wrong in resume creation");
// }





// };
const createresume = async (e) => {
  e.preventDefault();

  // ✅ PAGE 1 validation
  const page1Error = getPage1Error();
  if (page1Error) {
    alert(`நீ ${pagecount} page select பண்ணியிருக்க.
முதல் பக்கத்தில் "${page1Error}" நிரப்பவில்லை`);
    return;
  }

  // ✅ PAGE 2 validation
  if (pagecount >= 2) {
    const page2Error = getPage2Error();
    if (page2Error) {
      alert(`நீ ${pagecount} page select பண்ணியிருக்க.
இரண்டாம் பக்கத்தில் "${page2Error}" நிரப்பவில்லை`);
      return;
    }
  }

  // ✅ PAGE 3 validation
  if (pagecount >= 3) {
    const page3Error = getPage3Error();
    if (page3Error) {
      alert(`நீ ${pagecount} page select பண்ணியிருக்க.
மூன்றாம் பக்கத்தில் "${page3Error}" நிரப்பவில்லை`);
      return;
    }
  }

  try {
    let photoUrl = "";

    // 🔥 STEP 1: Upload photo using page1.photo
    if (page1.photo) {
      const formData = new FormData();
      formData.append("photo", page1.photo);

      const uploadRes = await API.post("/resume-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      photoUrl = uploadRes.data.url; // URL from backend
      console.log("✅ Photo uploaded successfully:", photoUrl);
    }

    // 🔥 STEP 2: Send resume details with photoUrl
    const response = await API.post("/resume-details", {
      pagecount,
      pageOne: { ...page1, photoUrl },
      pageTwo: page2,
      pageThree: page3,
    });

    let rawHtml = response.data.html;
    console.log("✅ Resume HTML received from backend");

    // 🔥🔥🔥 STEP 3: AGGRESSIVE PHOTO REPLACEMENT IN UI (BACKUP SAFETY)
    if (photoUrl) {
      console.log("🔥 UI: Doing additional photo replacement as backup");
      
      // Replace Strategy 1: PHOTO_PLACEHOLDER_URL
      rawHtml = rawHtml.replace(/PHOTO_PLACEHOLDER_URL/g, photoUrl);
      
      // Replace Strategy 2: Empty src=""
      rawHtml = rawHtml.replace(
        /<img\s+src=["']["']\s+class=["']profile-photo["']\s*\/?>/gi,
        `<img src="${photoUrl}" class="profile-photo" />`
      );
      
      // Replace Strategy 3: Any img with class="profile-photo"
      rawHtml = rawHtml.replace(
        /<img[^>]*class=["']profile-photo["'][^>]*>/gi,
        `<img src="${photoUrl}" class="profile-photo" />`
      );
      
      // Replace Strategy 4: src comes before class
      rawHtml = rawHtml.replace(
        /<img\s+src=["'][^"']*["']\s+class=["']profile-photo["']\s*\/?>/gi,
        `<img src="${photoUrl}" class="profile-photo" />`
      );

      console.log("✅ UI: Photo replacement complete");
    }

    // 🔥 STEP 4: Split pages and set preview
    const pagesArray = splitHTMLPages(rawHtml);
    
    // 🔥 STEP 5: VERIFY photo is in HTML before setting preview
    if (photoUrl) {
      const hasPhoto = rawHtml.includes(photoUrl);
      console.log(`🔍 Photo verification: ${hasPhoto ? "✅ FOUND" : "❌ NOT FOUND"}`);
      
      if (!hasPhoto) {
        console.error("❌ WARNING: Photo URL not found in HTML after replacement!");
        console.log("Photo URL:", photoUrl);
        console.log("HTML preview:", rawHtml.substring(0, 500));
      }
    }
    
    setPreviewPages(pagesArray);

    alert("All details filled correctly ✅ Resume created successfully");

  } catch (error) {
    console.error("❌ Resume creation error:", error);
    console.error("Error details:", error.response?.data || error.message);
    alert("Something went wrong in resume creation");
  }
};

// ...

const downloadResumePDF = async () => {
  if (previewPages.length === 0) {
    alert("No resume to download! Generate first.");
    return;
  }

  try {
    const response = await API.post(
      "/download-pdf",
      { htmlPages: previewPages },
      { responseType: "arraybuffer" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${page1.fullName || "resume"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download error:", error);
    alert("PDF download failed. Please try again.");
  }
};





const resumeTitleOpen=(e)=>{

  e.preventDefault();
    if (previewPages.length === 0) {
    alert("No resume to download! Generate first.");
    return;
  }
       setTitleOpen(true);

}


 useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleRef.current && !titleRef.current.contains(event.target)) {
        setTitleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);























  

  const handlePhotoChange =async (e) => {
   const file = e.target.files[0];
  if (file) {
    // backend அனுப்ப actual file
    ;
     const base64 = await fileToBase64(file)
    // browser preview-க்கு temporary URL
    const previewURL = URL.createObjectURL(file);
    setPreviewPhoto(previewURL);

    setPage1({ ...page1, photo: file ,photoBase64:base64})
  }
  };




  const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
};

// ============================
// ✅ Handle Resume Save
// ============================
const handleSaveResume = async (e) => {
  e.preventDefault();

  if (!titleName || titleName.trim() === "") {
    alert("Please enter a resume title before saving!");
    return;
  }

  if (!previewPages || previewPages.length === 0) {
    alert("No resume generated! Please create the resume first.");
    return;
  }

  try {
    // ==========================
    // ✅ Replace Page 1 photo placeholder with Base64 if exists
    // ==========================
   const updatedPages = previewPages.map((html, index) => {
  if (index === 0 && page1.photoBase64) {
    // எந்த <img> tag-லும் class="profile-photo" இருந்தாலும் Base64 replace பண்ணும்
    return html.replace(
      /<img[^>]*class=["']profile-photo["'][^>]*>/gi,
      `<img src="${page1.photoBase64}" class="profile-photo" />`
    );
  }
  return html; // மற்ற pages-ல் மாற்றம் வேண்டாம்
});


    // ✅ Update previewPages state
    setPreviewPages(updatedPages);

    // ==========================
    // ✅ Send to backend
    // ==========================
    const response = await API.post("/save-resume", {
      title: titleName.trim(),
      htmlPages: updatedPages
    });

    if (response.data.success) {
      alert("Resume saved successfully ✅");
      setTitleOpen(false);
      setTitleName("");
    } else {
      alert("Failed to save resume. Please try again.");
    }

  } catch (error) {
    console.error("Error saving resume:", error);
    alert("Something went wrong while saving the resume.");
  }
};

  return (
<div className="resume-details-page-full">
    <div className="resume-details-page">
    
      <h2 className="heading">Resume Details</h2>
      <form onSubmit={createresume}>
      <div className="select-page-section">
            <label>select page count:</label>
            <select
            value={pagecount}
            onChange={(e)=>setpagecount(e.target.value)}
            >
             
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
            </select>
            <p>your resume pages: {pagecount}</p>
      </div>














{pagecount >=1 &&(
     <div className="first-page-informations">
    
 <div className="photo-upload">
        <label>your Photo</label>
         <button className="remove-photo" onClick={(e)=>{
               e.preventDefault()
               setPage1({ ...page1, photo: null });
         }}>remove photo</button>
        <input
        className="resume-photo-input"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />

        {page1.photo && (
          <img
        
            src={PreviewPhoto}
            alt="Profile Preview"
            className="photo-preview"
          />
        )}
      </div>
<div className="other-first-pagedetails">

  <input
    type="text"
    placeholder="Type your full name"
    className="input-fullname"
    value={page1.fullName}
    onChange={(e) =>
      setPage1({ ...page1, fullName: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Type your Job Title"
    className="input-jobtitle"
    value={page1.jobTitle}
    onChange={(e) =>
      setPage1({ ...page1, jobTitle: e.target.value })
    }
  />

  <input
    type="email"
    placeholder="Type your email"
    className="input-email"
    value={page1.email}
    onChange={(e) =>
      setPage1({ ...page1, email: e.target.value })
    }
  />

  <input
    type="tel"
    placeholder="Type your phone number"
    className="input-phone"
    value={page1.phoneNumber}
    onChange={(e) =>
      setPage1({ ...page1, phoneNumber: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Address"
    className="input-address"
    value={page1.address}
    onChange={(e) =>
      setPage1({ ...page1, address: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Summary"
    className="input-summary"
    value={page1.summary}
    onChange={(e) =>
      setPage1({ ...page1, summary: e.target.value })
    }
  />

  <input
    type="text"
    placeholder="Skill"
    className="input-skill"
    value={page1.skill}
    onChange={(e) =>
      setPage1({ ...page1, skill: e.target.value })
    }
  />


  {/* //extra details  page 1*/}
  <input
  type="url"
  placeholder="LinkedIn Profile URL"
  className="input-linkedin"
  value={page1.linkedIn}
  onChange={(e) =>
    setPage1({ ...page1, linkedIn: e.target.value })
  }
/>

<input
  type="url"
  placeholder="GitHub / Portfolio URL"
  className="input-github"
  value={page1.github}
  onChange={(e) =>
    setPage1({ ...page1, github: e.target.value })
  }
/>

<input
  type="text"
  placeholder="Education"
  className="input-education"
  value={page1.education}
  onChange={(e) =>
    setPage1({ ...page1, education: e.target.value })
  }
/>

<input
  type="text"
  placeholder="Languages (comma separated)"
  className="input-languages"
  value={page1.languages}
  onChange={(e) =>
    setPage1({ ...page1, languages: e.target.value })
  }
/>

<input
  type="text"
  placeholder="Certifications (comma separated)"
  className="input-certifications"
  value={page1.certifications}
  onChange={(e) =>
    setPage1({ ...page1, certifications: e.target.value })
  }
/>
 {/* //extra details page 1 end  */}

</div>





        </div>




)}
       





{pagecount >= 2 &&(
    <div className="second-page-information">
  <textarea
  className="experience-input"
    placeholder="Experience"
    value={page2.experience}
    onChange={(e) =>
      setPage2({ ...page2, experience: e.target.value })
    }
  />

  <textarea
  className="projects-input"
    placeholder="Projects"
    value={page2.projects}
    onChange={(e) =>
      setPage2({ ...page2, projects: e.target.value })
    }
  />

  <textarea
  className="cetrification-input"
    placeholder="Certifications"
    value={page2.certifications}
    onChange={(e) =>
      setPage2({ ...page2, certifications: e.target.value })
    }
  />

{/* extradata page 2 start */}
  
  <textarea
    className="achievements-input"
    placeholder="Achievements"
    value={page2.achievements}
    onChange={(e) =>
      setPage2({ ...page2, achievements: e.target.value })
    }
  />

  <textarea
    className="volunteering-input"
    placeholder="Volunteering"
    value={page2.volunteering}
    onChange={(e) =>
      setPage2({ ...page2, volunteering: e.target.value })
    }
  />

  <textarea
    className="awards-input"
    placeholder="Awards"
    value={page2.awards}
    onChange={(e) =>
      setPage2({ ...page2, awards: e.target.value })
    }
  />

  <textarea
    className="notableProjects-input"
    placeholder="Notable Projects"
    value={page2.notableProjects}
    onChange={(e) =>
      setPage2({ ...page2, notableProjects: e.target.value })
    }
  />

  <textarea
    className="publications-input"
    placeholder="Publications"
    value={page2.publications}
    onChange={(e) =>
      setPage2({ ...page2, publications: e.target.value })
    }
  />
</div>


// extra data page 2 end 

)}









{pagecount >= 3 &&(
    <div className="third-page-information">
  <textarea
  className="language-input"
    placeholder="Languages"
    value={page3.languages}
    onChange={(e) =>
      setPage3({ ...page3, languages: e.target.value })
    }
  />

  <textarea
  className="Achievement-input"
    placeholder="Achievements"
    value={page3.achievements}
    onChange={(e) =>
      setPage3({ ...page3, achievements: e.target.value })
    }
  />

  <textarea
  className="interests-input"
    placeholder="Interests"
    value={page3.interests}
    onChange={(e) =>
      setPage3({ ...page3, interests: e.target.value })
    }
  />


  {/* extra dta for page 3 */}
   <textarea
    className="softSkills-input"
    placeholder="Soft Skills"
    value={page3.softSkills}
    onChange={(e) =>
      setPage3({ ...page3, softSkills: e.target.value })
    }
  />

  <textarea
    className="hobbies-input"
    placeholder="Hobbies"
    value={page3.hobbies}
    onChange={(e) =>
      setPage3({ ...page3, hobbies: e.target.value })
    }
  />


  <textarea
    className="community-input"
    placeholder="Community"
    value={page3.community}
    onChange={(e) =>
      setPage3({ ...page3, community: e.target.value })
    }
  />

  {/* extra data for page 3 end  */}



</div>



)}


 <div className="preview-page-div">
   {previewPages.map((pageHTML, index) => (
    <iframe
      key={index}
      className="preview-page-div"
      srcDoc={pageHTML}
      title={`Resume Page ${index}`}
    />
  ))}


 {previewPages.length !== 0 && (
  <div>
    <button
      type="button"
      className="resume-download-btn"
      onClick={downloadResumePDF}
      style={{ marginLeft: "10px" }}
    >
      Download PDF
    </button>
    <button 
      className="resume-save-btn"
      onClick={resumeTitleOpen}
    >
      Save Resume
    </button>
  </div>
)}

   
  {titleOpen && (
  <div className="overlay">
    <div className="resume-title-content" ref={titleRef}>
      <input
        type="text"
        placeholder="Enter resume title"
        value={titleName}
        onChange={(e) => setTitleName(e.target.value)}
      />
      <button onClick={handleSaveResume}>Save</button>
      <button onClick={() => setTitleOpen(false)}>Cancel</button>
    </div>
  </div>
)}

</div>



        <div className="genarate-resume-content">
            <button className="resume-generate-btn" type="submit">
                create your resume
            </button>
        </div>
      </form>
    </div>
</div>



    
  );
};

export default Resumedetails;
