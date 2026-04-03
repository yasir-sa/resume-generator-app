import { useRef, useState ,useEffect} from "react";
import "./Screeninterview.css";
import { useLocation } from 'react-router-dom';
import API from "../../api"
// import Robot from "../robot/Robot"
import { Volume2 } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


import { init, showModel, hideModel, setSpeaking, setAnimation } from "../script/script.js";
import Tesseract from 'tesseract.js';


function Screeninterview() {

  const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recordedVideo, setRecordedVideo] = useState(null);
  // const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([
  { role: "ai", text: "Hello" },
  { role: "user", text: "Hi" },
  { role: "ai", text: "Explain useEffect" },
  { role: "user", text: "I know React" },
   { role: "ai", text: "Hello" },
  { role: "user", text: "Hi" },
  { role: "ai", text: "Explain useEffect" },
  { role: "user", text: "I know React" }
]);


const recognitionRef = useRef(null);
const isListeningRef=useRef(false)
const [speechText, setSpeechText] = useState("");
const [isProcessing, setIsProcessing] = useState(false);
const messagesEndRef = useRef(null);
const messagesContainerRef = useRef(null);
const [voices, setVoices] = useState([]);
const [isSpeaking, setIsSpeaking] = useState(false);
const [activeSpeakingIndex, setActiveSpeakingIndex] = useState(null);
const [userListening, setUserListening] = useState(false);
const roboContainerRef = useRef(null);



const [animationMessage, setAnimationMessage] = useState("hi_animation");
// const [animationName, setAnimationName] = useState("talk");
const [animationName, setAnimationName] = useState("hi");
const [manualType, setManualType] = useState([]);      // Type 1: Typed Skills
  const [uploadedResume, setUploadedResume] = useState([]); // Type 2: PDF Text
  const [htmlResume, setHtmlResume] = useState([]);



useEffect(() => {
    if (roboContainerRef.current) {
      init(roboContainerRef.current);
    }
  }, []);
  // 🔴 isSpeaking மாறும்போது 3D மாடலுக்குத் தகவல் அனுப்புகிறோம்

useEffect(() => {
    setSpeaking(isSpeaking);
    
    if (typeof setAnimation === "function") {
        // 🔴 பேசும்போது State-ல் உள்ள "talk" செல்லும், பேசாதபோது "idle" செல்லும்
        setAnimation(isSpeaking ? animationName : "idle");
    }
}, [isSpeaking, animationName]);
// // ▶ START CAMERA + RECORD
  // const startRecording = async () => {
  //   try {

  //     // remove old preview
  //     setRecordedVideo(null);

  //     // open camera only once
  //     if (!streamRef.current) {

  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: {
  //           facingMode: "user",
  //           width: { ideal: 1280 },
  //           height: { ideal: 720 }
  //         },

  //         // ✅ SOUND CLARITY SETTINGS
  //         audio: {
  //           echoCancellation: true,
  //           noiseSuppression: true,
  //           autoGainControl: true,
  //           channelCount: 1,        // mono audio → less echo
  //           sampleRate: 48000
  //         }
  //       });

  //       streamRef.current = stream;
  //       videoRef.current.srcObject = stream;
  //     }

  //     // ✅ choose best supported codec
  //     const options = MediaRecorder.isTypeSupported(
  //       "video/webm;codecs=vp9,opus"
  //     )
  //       ? { mimeType: "video/webm;codecs=vp9,opus" }
  //       : { mimeType: "video/webm" };

  //     const mediaRecorder = new MediaRecorder(streamRef.current, options);

  //     mediaRecorderRef.current = mediaRecorder;
  //     chunksRef.current = [];

  //     mediaRecorder.ondataavailable = (event) => {
  //       if (event.data.size > 0) {
  //         chunksRef.current.push(event.data);
  //       }
  //     };

  //     // 🎬 recording finished
  //     mediaRecorder.onstop = () => {
  //       const blob = new Blob(chunksRef.current, {
  //         type: "video/webm"
  //       });

  //       const videoURL = URL.createObjectURL(blob);
  //       setRecordedVideo(videoURL);
  //     };

  //     mediaRecorder.start();

  //   } catch (err) {
  //     console.log("Camera/Mic error:", err);
  //   }
  // };

  // // ⏹ STOP RECORDING + CAMERA CLOSE
  // const stopRecording = () => {

  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //   }

  //   // ✅ camera hardware OFF
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach(track => track.stop());
  //     streamRef.current = null;
  //   }

  //   if (videoRef.current) {
  //     videoRef.current.srcObject = null;
  //   }
  // };



  // CAMERA START
  const startCamera =async () => {
    console.log("Camera started");
    try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

     streamRef.current = stream;

    if(videoRef.current){
      videoRef.current.srcObject=stream;
    }


    
    const mediaRecorder = new MediaRecorder(stream);
     mediaRecorderRef.current = mediaRecorder;


     mediaRecorder.ondataavailable =(event)=>{
      if(event.data.size>0){
        chunksRef.current.push(event.data);
      }
     }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm"
      });

      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);

      chunksRef.current = [];
    };
  //     const video = videoRef.current;

  // if (video && video.srcObject) {

  //   const stream = video.srcObject;
  //   const tracks = stream.getTracks();

  //   tracks.forEach(track => track.stop());

  //   video.srcObject = null;
  // }
mediaRecorder.start();

    }
    catch(error){
     console.error("camara access error:",error)
    }

  };
    const stopcamara = () => {
    
      console.log("Stopping interview...");

  //  stopListening();


  // ⭐ 1. Stop recording (important)
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop();
  }

  // ⭐ 2. Stop camera stream (camera OFF)
  if (streamRef.current) {
    const tracks = streamRef.current.getTracks();

    tracks.forEach(track => track.stop());

    streamRef.current = null;
  }

  // ⭐ 3. Remove live video from video tag
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  };

  // CHATBOT START
  const startChatbot = () => {
    console.log("Chatbot started");
    const SpeechRecognition=
window.SpeechRecognition || window.webkitSpeechRecognition;
      console.log(SpeechRecognition);
      const recognition = new SpeechRecognition();
      // recognition.lang="en-US";
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = false;
 recognition.onresult = (event) => {
  // ⭐ AI pesitu irundha (isListeningRef false-ah irundha) 
  // mic vanguva data-va accept panna koodathu.
  if (!isListeningRef.current) {
    console.log("AI is speaking, ignoring result...");
    return; 
  }

  const text = event.results[event.resultIndex][0].transcript;
  console.log("your text:", text);
  setSpeechText(text);
};
    // ✅ ADD USER MESSAGE TO CHAT

  
  // ⭐ AUTO RESTART LISTENING
 recognition.onend = () => {
    console.log("Recognition ended, checking for restart...");
    
    // Safety check: isListeningRef true-va irundha mattum restart pannu
    if (isListeningRef.current) {
      setTimeout(() => {
        try {
          // Check if it's already running before starting
          recognition.start();
          console.log("Restarted successfully");
        } catch (err) {
          // Inga error vandha "Already started"-nu artham, so ignore pannidalam
          console.log("Recognition is already running, no need to restart.");
        }
      }, 300); // 300ms gap kodunga, browser clear aaga time venum
    }
  };

  // Initial Start-kum try-catch podunga
  try {
    recognition.start();
  } catch (e) {
    console.log("Initial start failed or already active:", e);
  }
    recognitionRef.current = recognition;
    
  };

useEffect(() => {
  if (!speechText) return;
  if (isProcessing) return;

  // ⭐ AI pesikittu irundha (userListening true), indha function-ah execute pannaadhu
  if (userListening) {
    console.log("AI is speaking, so ignoring this speech input.");
    return;
  }

  const timer = setTimeout(() => {
    setMessages(prev => [
      ...prev,
      { role: "user", text: speechText }
    ]);

    sendMessageToBackend(speechText);
    
    // Message anupuna apuram speechText-ah clear pannanum
    // Illana userListening false aanavudan thirumba old text anuppa vaaippu iruku
    setSpeechText(""); 

  }, 400);

  return () => clearTimeout(timer);

}, [speechText, userListening]); // userListening dependency-ah add pannunga
// useEffect(() => {
//   messagesEndRef.current?.scrollIntoView({
//     behavior: "smooth"
//   });
// }, [messages]);


useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  container.scrollTop = container.scrollHeight;
}, [messages]);


const sendMessageToBackend =async(text)=>{
 try{
     setIsProcessing(true);
     const response=await API.post("/interview/chat",{
      message:text,
      oldData: messages
     })


     const aiReply=response.data.reply;
     setMessages(prev=>[
      ...prev,
      {role:"ai",text:aiReply}
     ])
      speakAI(aiReply);

 }   
 catch(error){
console.error("interview chat send error: ",error);
 }
finally {
    setIsProcessing(false);
  }
}
// const speakAI = (text) => {

//   if (!window.speechSynthesis) return;
//   if (!text?.trim()) return;

//   // ⭐ STOP LISTENING
//   recognitionRef.current?.stop();

//   speechSynthesis.cancel();

//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = "en-US";
//   utterance.rate = 1;
//   utterance.pitch = 1;

//   // ⭐ AFTER AI FINISH → START LISTENING AGAIN
//   utterance.onend = () => {
//     console.log("AI finished speaking");

//     if (isListeningRef.current) {
//       recognitionRef.current?.start();
//     }
//   };

//   speechSynthesis.speak(utterance);
// };



useEffect(() => {
  const loadVoices = () => {
    const voiceList = speechSynthesis.getVoices();
    setVoices(voiceList);
    console.log("Available voices:", voiceList);
  };

  loadVoices();

  speechSynthesis.onvoiceschanged = loadVoices;

}, []);
// 1. ஒரு புதிய State-ஐ உங்கள் Component-க்குள் சேர்க்கவும்
const speakAI = (text) => {
  if (!window.speechSynthesis || !text?.trim()) return;

  // மைக்ரோபோனை நிறுத்துகிறோம்
  recognitionRef.current?.stop();
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // 1. குரலைத் தேர்ந்தெடுத்தல் (Voices இன்னும் வரவில்லை என்றால் default எடுக்கும்)
  const femaleVoice = voices.find((v) => v.name.includes("Zira") || v.name.includes("Google US English"));
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1.2;

  // 2. ⭐ முக்கியமான மாற்றம்: speak() செய்யுமுன் events-ஐ செட் பண்ணவும்
  utterance.onstart = () => {
    console.log("AI starts speaking... Animation should start");
    setIsSpeaking(true); // இது Robot.jsx-க்கு சிக்னல் அனுப்பும்
  };

  utterance.onend = () => {
    console.log("AI finished speaking.");
    setIsSpeaking(false); // வாய் அசைப்பதை நிறுத்தும்
    
    // AI பேசி முடித்ததும் மீண்டும் மைக் ஆன் ஆக வேண்டும்
    if (isListeningRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log("Recognition restart ignored");
      }
    }
  };

  utterance.onerror = (event) => {
    console.error("SpeechSynthesis error:", event.error);
    setIsSpeaking(false);
  };

  // 3. இப்போது பேசச் சொல்லுங்கள்
  speechSynthesis.speak(utterance);
};



  // MAIN FUNCTION
  const startInterview = () => {
     showModel();
    startCamera();   // function 1
    startChatbot();
    isListeningRef.current = true;
    recognitionRef.current?.start();
    
    // startListening(); // function 2
   
  };
  const stopinterview=()=>{
     hideModel();
    stopcamara();
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    

   

  }



//   const startListening = () => {

//   const SpeechRecognition =
//     window.SpeechRecognition || window.webkitSpeechRecognition;

//   if (!SpeechRecognition) {
//     alert("Speech Recognition not supported");
//     return;
//   }

//   const recognition = new SpeechRecognition();

//   // ⭐ FAST SETTINGS
//   recognition.continuous = true;      // stop ஆகாம listen
//   recognition.interimResults = true;  // LIVE text (fast)
//   recognition.lang = "en-US";

//   recognitionRef.current = recognition;

//   recognition.onresult = (event) => {

//     let liveText = "";

//     // latest speech collect
//     for (let i = event.resultIndex; i < event.results.length; i++) {
//       liveText += event.results[i][0].transcript;
//     }

//     console.log("Live:", liveText);
//   };

//   recognition.start();
// };
// const stopListening = () => {
//   if (recognitionRef.current) {
//     recognitionRef.current.stop();
//   }
// };




useEffect(() => {

  if (messages.length === 0) return;

  // last message
  const lastMessage = messages[messages.length - 1];

  // only user message send
  if (lastMessage.role === "user") {
    usertextsend(lastMessage);
  }

}, [messages]);




const usertextsend = async(message)=>{
  try{
       const res = await API.post("/interview-user",message);
       console.log("Backend response:", res.data);
  }
  catch(error){
console.error("interview user text send error :", error);
  }
    
}



const clikaispeak = (text, index) => {
  if (!window.speechSynthesis || !text?.trim()) return;

  // 1. ஏற்கனவே பேசிக்கொண்டிருந்தால் அதை நிறுத்தவும்
  window.speechSynthesis.cancel();
  
  // 2. கிளிக் செய்தவுடன் Listen செய்வதை நிறுத்தவும்
  setUserListening(false); // UI-ல் மைக் ஆஃப் ஆகும்
  isListeningRef.current = false; // Logic-ல் Listen செய்வது தடுக்கப்படும்

  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop(); // மைக்ரோபோனை உடனடியாக நிறுத்தவும்
    } catch (err) {
      console.log("Stop failed:", err);
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // 🎤 Female Voice Selection
  const allVoices = window.speechSynthesis.getVoices();
  let selectedVoice = allVoices.find(v => v.name.includes("Zira")) || 
                      allVoices.find(v => v.name.includes("Google US English") && v.name.includes("Female")) ||
                      allVoices.find(v => v.name.toLowerCase().includes("female"));

  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.pitch = 1.3; 
  utterance.rate = 1.0;
  utterance.lang = "en-US";

  // AI பேசத் தொடங்கும் போது
  utterance.onstart = () => {
    setIsSpeaking(true); // 3D மாடல் வாய் அசையத் தொடங்கும்
    setActiveSpeakingIndex(index);
  };

  // 💡 AI பேசி முடித்த பிறகு
  utterance.onend = () => {
    setIsSpeaking(false); // 3D மாடல் வாய் அசைவு நிற்கும்
    setActiveSpeakingIndex(null);
    
    // 🛑 முக்கிய மாற்றம்: இங்கே Listen-ஐ மீண்டும் ஸ்டார்ட் செய்ய வேண்டாம்.
    // பயனர் தானாக மைக்கைத் தட்டினால் மட்டுமே Listen செய்ய வேண்டும்.
    isListeningRef.current = false; 
    setUserListening(false);
    
    console.log("AI speech finished. Listening remains OFF.");
  };

  window.speechSynthesis.speak(utterance);
};

















const location = useLocation();
const interviewData = location.state;

useEffect(() => {


const extractPdfText = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // 🔴 PDFJS மூலம் பிடிஎஃப்-ஐ லோடு செய்கிறோம்
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    console.log(`PDF loaded. Total pages: ${pdf.numPages}. Improving Quality for Full Extraction...`);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // 🔴 மாற்றப்பட்டது: Scale 3 (இது படத்தை இன்னும் தெளிவாக மாற்றும், அதனால் சின்ன எழுத்துக்களும் ஸ்கேன் ஆகும்)
      const viewport = page.getViewport({ scale: 3 }); 
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 🔴 கன்வாஸில் பக்கத்தை வரைகிறோம்
      await page.render({ canvasContext: context, viewport: viewport }).promise;

      // 🔴 Tesseract OCR - Advanced Settings
      const { data: { text } } = await Tesseract.recognize(
        canvas.toDataURL("image/png"),
        'eng', 
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`Page ${i} Progress: ${(m.progress * 100).toFixed(2)}%`);
            }
          },
          // 🔴 இந்த செட்டிங் பிடிஎஃப்-ல் உள்ள காலம் மற்றும் வரிகளைச் சரியாகப் பிரிக்கும்
          tessedit_pageseg_mode: '3' 
        }
      );

      fullText += `--- Page ${i} ---\n` + text + "\n";
    }

    // 🔴 செக் பாயிண்ட்: முழு டெக்ஸ்ட்டையும் கன்சோலில் பிரிண்ட் செய்கிறோம்
    console.log("COMPLETE RESUME DATA:", fullText);

    const combinedData = {
      resumeContent: fullText.trim(),
      interviewType: interviewData.interviewType || "",
      domain: interviewData.domain || "",
      difficulty: interviewData.difficulty || "" || "3",
      notes: interviewData.notes || ""
    };

    setUploadedResume([combinedData]);
    console.log("✅ Full OCR extraction finished successfully!");

  } catch (error) {
    console.error("❌ Extraction Error:", error);
  }
};











    if (interviewData) {
      console.log("--- Starting Data Storage Process ---");

      // 🔵 TASK 1: Manual Type Data (இன்றைய முதல் வேலை)
      if (interviewData.skills && interviewData.skills.trim() !== "") {
        console.log("Saving to manualType array...");
        // ஸ்கில்ஸை ஒரு அரேவில் சேமிக்கிறோம்
        setManualType([interviewData.skills]);
      }

      // 🔵 TASK 2: Uploaded Resume (PDF) - அடுத்த கட்டம்
// 🔵 TASK 2: Uploaded Resume (PDF with OCR) - திருத்தப்பட்ட பகுதி
      else if (interviewData.resume) {
        console.log("Detected PDF (Image/Scanned). Initializing OCR Engine...");
        
        // இப்போதைக்கு ஒரு தற்காலிக மெசேஜ் காண்பிக்கிறோம் (Optional)
        setUploadedResume([{ 
          resumeContent: "Processing PDF... Please wait for a few seconds.",
          status: "loading" 
        }]);

        // OCR மூலம் டெக்ஸ்ட் எடுக்கும் அந்த அட்வான்ஸ் ஃபங்க்ஷனை அழைக்கிறோம்
        extractPdfText(interviewData.resume);
      }

      // 🔵 TASK 3: Project Resume (HTML) - அதற்கடுத்த கட்டம்
   // 🔵 TASK 3: Project Resume (HTML - Multiple Pages)
    // 🔵 TASK 3: Project Resume (HTML - Multiple Pages with Style Cleaner)
      else if (interviewData.projectResume) {
        console.log("Detected HTML Project Resume. Cleaning styles and tags...");

        const htmlPages = Array.isArray(interviewData.projectResume) 
          ? interviewData.projectResume 
          : [interviewData.projectResume];

        let allCleanText = "";

        htmlPages.forEach((page, index) => {
          let rawHtml = page.html_codes || "";
          
          // 1. <style> மற்றும் <script> டேகுகளுக்குள் இருக்கும் தேவையற்ற கோடிங்குகளை நீக்க
          let cleanPageText = rawHtml
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ') // CSS ஸ்டைல்களை நீக்கும்
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' '); // JavaScript-ஐ நீக்கும்
            
          // 2. இப்போது மீதமுள்ள HTML டேகுகளை (<div>, <h1> போன்றவை) நீக்க
          cleanPageText = cleanPageText
            .replace(/<[^>]*>/g, ' ') 
            .replace(/\s+/g, ' ')    
            .trim();

          allCleanText += `--- Page ${index + 1} ---\n${cleanPageText}\n\n`;
        });

        const combinedData = {
          resumeContent: allCleanText.trim(),
          interviewType: interviewData.interviewType || "",
          domain: interviewData.domain || "",
          difficulty: interviewData.difficulty || "3",
          notes: interviewData.notes || ""
        };

        // 🔴 HTML ஸ்டேட்டில் சேமிக்கிறோம்
        setHtmlResume([combinedData]);
        console.log("✅ Cleaned HTML Content (No CSS):", allCleanText);
      }
    }
  }, [interviewData]);

  // கன்சோலில் செக் செய்ய
  // console.log("Current States:", { manualType, uploadedResume, htmlResume });


// 🔴 இந்த useEffect மூன்று அரேக்களையும் கண்காணிக்கும் (Monitor)
useEffect(() => {
  console.log("--- Monitoring Interview Data States ---");

  // 1. Manual Type Data இருந்தால்
  if (manualType.length > 0) {
    console.log("📢 Final Data from Manual Type:", manualType[0]);
  }

  // 2. Uploaded PDF Data இருந்தால்
  if (uploadedResume.length > 0) {
    console.log("📢 Final Data from Uploaded Resume (PDF):", uploadedResume[0]);
  }

  // 3. HTML Project Data இருந்தால்
  if (htmlResume.length > 0) {
    console.log("📢 Final Data from Project Resume (HTML):", htmlResume[0]);
  }

}, [manualType, uploadedResume, htmlResume]); // ⬅️ இந்த மூன்று அரேக்களில் எது மாறினாலும் இது ரன் ஆகும்




  return (
    // <div className="interview-screen">

    //   <h2>AI Mock Interview</h2>

    //   {/* 🎥 LIVE CAMERA */}
    //   <video
    //     ref={videoRef}
    //     autoPlay
    //     playsInline
    //     muted   // ✅ VERY IMPORTANT (prevents echo loop)
    //     className="camera-video"
    //   />

    //   {/* 🎬 RECORDED VIDEO PREVIEW */}
    //   {recordedVideo && (
    //     <div className="preview-box">
    //       <h3>Your Answer Preview</h3>
    //       <video
    //         src={recordedVideo}
    //         controls
    //         className="preview-video"
    //       />
    //     </div>
    //   )}

    //   <div className="btn-group">
    //     <button className="start-btn" onClick={startRecording}>
    //       Start Interview
    //     </button>

    //     <button className="stop-btn" onClick={stopRecording}>
    //       Complete
    //     </button>
    //   </div>

    // </div>

<>
 <div className="interview-screen">

      {/* TOP SECTION */}
      <div className="camera-chatbot">

        {/* Left → Interview Camera */}
        <div className="camera-container">
            <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
  ></video>
        </div>

        {/* Right → Chatbot */}
        <div className="chatbot-container">
          
            <div className="chatbot-header">
   
    <div className="ai-speak-robo" ref={roboContainerRef}>
  
  {/* <Robot isSpeaking={isSpeaking}    animationMessage={animationMessage}/> */}
</div>
        <h1>🎙 AI Interview Assistant</h1>
  </div>


          <div className="chatbot-messages"
           ref={messagesContainerRef}>
  {messages.map((msg, index) => (
    <div
      key={index}
      className={msg.role === "ai" ? "ai-message" : "user-message"}
      // onClick={() => clikaispeak(msg.text)}
    >
      {msg.text}
 
<Volume2 
    className="speaker-icon" // CSS class inga add pannunga
    size={20} 
    color={activeSpeakingIndex === index ? "#22c55e" : "#888"} 
    onClick={() => clikaispeak(msg.text, index)}
  />
   
    </div>
  ))}

  <div ref={messagesEndRef}></div>
</div>

         

        <div className="chatbot-controls">
    <button className="mic-btn">Start Talking</button>
  </div>


        </div>
        {recordedVideo && (  <div className="prview-video-container">
          {recordedVideo && (
    <video controls src={recordedVideo}></video>
  )}

          <button className="preview-video-download-btn">download</button>
           <button className="preview-video-save-btn">save video</button>
       
        </div>  )}

      </div>

      {/* BOTTOM SECTION */}
      <div className="results-container">
           here al result ingetha varum ok ithu height autova erukkanum ok 

      </div>
      <button onClick={startInterview}>
        start interview
      </button>
        <button onClick={stopinterview}>
        stop interview
      </button>
      <button className="save-interview-btn">
        save interview
      </button>

    </div>

</>



  );
}

export default Screeninterview;
