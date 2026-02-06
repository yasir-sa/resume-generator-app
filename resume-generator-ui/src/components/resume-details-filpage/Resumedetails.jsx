import React, { useState } from "react";
import "./resumedetails.css";
import API from "../../api"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Resumedetails = () => {
 
  const [pagecount,setpagecount]=useState(1);
  const [PreviewPhoto,setPreviewPhoto]=useState(null)
  const [page1, setPage1] = useState({
  fullName: "yasir",
  jobTitle: "mernstack",
  email: "yasirsa05@gmail.com",
  phoneNumber: "8270089089",
  address: "71/96 Kalvathunayagam street",
  summary: "Motivated and detail-oriented aspiring Full Stack Developer with a strong foundation in HTML, CSS, JavaScript, React, and backend fundamentals. Experienced in building responsive web applications, REST APIs, and real-world projects including resume generators and e-commerce layouts. Passionate about learning modern frameworks, writing clean code, and solving practical problems through technology.",
  photo:null,
  photoBase64: null, 
  skill:"react,node,express,python,postgrs,githup",
});
const [previewPages, setPreviewPages] = useState([]);




 const [page2, setPage2] = useState({
  experience:
    "Completed multiple academic and personal projects during my college studies, gaining hands-on experience in front-end and basic back-end development. Worked with HTML, CSS, JavaScript, and React to build responsive and user-friendly web applications. Familiar with version control using Git and collaborative project workflows.",

  projects:
    "E-commerce Web Application – Developed a responsive shopping platform with product listing, cart functionality, and user interface optimization.\n" +
    "To-Do List Application – Built a task management application with CRUD operations and clean UI for improved productivity.\n" +
    "AI Career Analyzer – Created a basic AI-driven tool to analyze user skills and suggest suitable career paths using structured logic.",

  certifications:
    "Currently pursuing skill development through self-learning and academic coursework. Actively enhancing knowledge in full-stack web development and modern JavaScript frameworks."
});



    const [page3, setPage3] = useState({
    languages: "",
    achievements: "",
    interests: "",
  });


const getPage1Error = () => {
  if (!page1.fullName) return "Full Name";
  if (!page1.jobTitle) return "Job Title";
  if (!page1.email) return "Email";
  if (!page1.phoneNumber) return "Phone Number";
  if (!page1.address) return "Address";
  if (!page1.skill) return "Skill";
  if (!page1.photo) return "Profile Photo";
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



const fileToBase64=(file)=>{
    return new Promise((resolve,reject)=>{
        const reader = new FileReader();
           reader.readAsDataURL(file);
           reader.onload = () => {
      resolve(reader.result); // Base64 string
    };
       reader.onerror = (error) => {
      reject(error);
    };
    });
}




const splitBase64 = (base64, chunkSize = 50000) => {
  const chunks = [];
  for (let i = 0; i < base64.length; i += chunkSize) {
    chunks.push(base64.slice(i, i + chunkSize));
  }
  return chunks;
};




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





  const splitHTMLPages = (htmlString) => {
  return htmlString
    .split("</html>")
    .map(page => page.trim())
    .filter(page => page.length > 0)
    .map(page => page + "</html>");
};








const createresume =async (e) => {
  e.preventDefault();

  // PAGE 1 – always mandatory
  const page1Error = getPage1Error();
  if (page1Error) {
    alert(`நீ ${pagecount} page select பண்ணியிருக்க.
முதல் பக்கத்தில் "${page1Error}" நிரப்பவில்லை`);
    return;
  }

  // PAGE 2 – only if pagecount >= 2
  if (pagecount >= 2) {
    const page2Error = getPage2Error();
    if (page2Error) {
      alert(`நீ ${pagecount} page select பண்ணியிருக்க.
இரண்டாம் பக்கத்தில் "${page2Error}" நிரப்பவில்லை`);
      return;
    }
  }

  // PAGE 3 – only if pagecount === 3
  if (pagecount >=3) {
    const page3Error = getPage3Error();
    if (page3Error) {
      alert(`நீ  ${pagecount} page select பண்ணியிருக்க.
மூன்றாம் பக்கத்தில் "${page3Error}" நிரப்பவில்லை`);
      return;
    }
  }

  // ✅ ALL GOOD
 
try {
  const photoChunks = page1.photoBase64 ? splitBase64(page1.photoBase64) : [];

const response = await API.post("/resume-details", {
  pagecount,
  pageOne: page1,
  pageTwo: page2,
  pageThree: page3,
  photoChunks // அனுப்பிறோம் small chunks
});
  const rawHtml = response.data.html;
  const pagesArray = splitHTMLPages(rawHtml);
  setPreviewPages(pagesArray);

  alert("All details filled correctly ✅ Resume can be created");
} catch (error) {
  console.error(error);
  alert("Something went wrong in resume creation");
}





};




// ...

const downloadResumePDF = async () => {
  if (previewPages.length === 0) {
    alert("No resume to download! Generate first.");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4"); // Portrait, mm, A4 size

  for (let i = 0; i < previewPages.length; i++) {
    // Create temporary div to render iframe HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = previewPages[i];
    tempDiv.style.width = "794px"; // approx A4 width in px
    tempDiv.style.padding = "10px";
    document.body.appendChild(tempDiv);

    // Render div to canvas
    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Add image to PDF
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Remove temp div
    document.body.removeChild(tempDiv);
  }

  // Save PDF
  pdf.save(`${page1.fullName || "resume"}.pdf`);
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
</div>




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
</div>



)}


 <div className="preview-page-div">
  {previewPages.map((pageHTML, index) => (
    <iframe
      key={index}
      srcDoc={pageHTML}
      title={`Resume Page ${index }`}
      
    />
  ))}
    <button
    type="button"
    className="resume-download-btn"
    onClick={downloadResumePDF}
    style={{ marginLeft: "10px" }}
  >
    Download PDF
  </button>
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
