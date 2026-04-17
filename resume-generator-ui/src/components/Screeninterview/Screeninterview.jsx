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
// 1. காம்போனென்ட்டுக்கு வெளியே டிஃபைன் செய்வது நல்லது
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
import { useNavigate } from 'react-router-dom';

function Screeninterview() {
const navigate = useNavigate();
  const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recordedVideo, setRecordedVideo] = useState(null);
  // const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([

  { role: "ai", text: "Hello, I am Anna. Please provide a brief self-introduction to start our interview." },
  { role: "user", text: "I am Yasir, a MERN stack developer looking for Fullstack roles." },
  
  // Question 1: Correct
  { role: "ai", text: "Great! Let's start. Can you explain the primary purpose of React's Virtual DOM?" },
  { role: "user", text: "It updates only changed parts of the UI to improve performance significantly." },
  
  // Question 2: Correct
  { role: "ai", text: "Excellent! How does the 'useEffect' hook handle side effects in functional components?" },
  { role: "user", text: "It runs code after rendering, like fetching data or setting up subscriptions." },
  
  // Question 3: Wrong (1/5)
  { role: "ai", text: "Great! What is the difference between 'state' and 'props' in React?" },
  { role: "user", text: "Both are exactly the same and used for storing local data." },
  
  // Question 4: Correction + Question
  { role: "ai", text: "Actually, state is internal while props are passed down. What is the role of Express.js middleware?" },
  { role: "user", text: "It is used only for connecting the database to the frontend." },
  
  // Question 5: Correction + Question (Wrong 2/5)
  { role: "ai", text: "Middleware processes requests before they reach routes. Explain the concept of 'Hoisting' in JavaScript." },
  { role: "user", text: "Variables and function declarations are moved to the top of their scope during execution." },
  
  // Question 6: Correct
  { role: "ai", text: "Excellent! What is 'Redux' and why is it used in large applications?" },
  { role: "user", text: "Redux is a database used to store images for the website." },
  
  // Question 7: Correction + Question (Wrong 3/5)
  { role: "ai", text: "Redux is for state management, not images. What is the purpose of 'git merge' command?" },
  { role: "user", text: "It is used to delete the entire project from the cloud." },
  
  // Question 8: Correction + Question (Wrong 4/5)
  { role: "ai", text: "Merge combines different code branches together. What is the difference between SQL and NoSQL databases?" },
  { role: "user", text: "SQL is relational with schemas; NoSQL is non-relational and document-based." },
  
  // Question 9: Correct
  { role: "ai", text: "Great! Explain what a 'JWT' (JSON Web Token) is used for." },
  { role: "user", text: "JWT is a tool to design the CSS of a webpage." },
  
  // Question 10: Correction + Final Question (Wrong 5/5)
  { role: "ai", text: "JWT is actually for secure authentication. Finally, what are 'REST API' methods?" },
  { role: "user", text: "GET, POST, PUT, and DELETE are the standard methods used for communication." },
  
  // Final Message
  { role: "ai", text: "Correct. REST methods define resource actions. Interview complete! Great effort today, keep practicing!" }

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
// இது இருக்கிறதா என்று செக் பண்ணுங்கள்
const [isInitialSyncing, setIsInitialSyncing] = useState(true);
const [isCompleted, setIsCompleted] = useState(false);
const [interviewCompleted, setInterviewCompleted] = useState(true);
const [isListening, setIsListening] = useState(false);




  // const [interviewResults] = useState({
  //   candidateName: "YASIR",
  //   domain: "FULLSTACK (MERN)",
  //   difficulty: "1-2",
  //   interviewType: "TECHNICAL HR",
  //   scores: {
  //     resume: { value: 82, label: "VERY GOOD" },
  //     interview: { value: 85, label: "EXCELLENT" },
  //   },
  //   resumeAnalysis: {
  //     matchPercentage: 85,
  //     keySkills: ["React", "Node", "Mongo"],
  //     missingKeywords: "'Redux', 'AWS Fundamentals', 'Agile Methodology'",
  //     projectImpact:
  //       "Make 'simple todo list' quantifiable (e.g., 'handling 50+ entries').",
  //     formattingFeedback: [
  //       "Add LinkedIn URL to professional profile.",
  //       "Use Quantifiable Metrics.",
  //     ],
  //   },
  //   mistakes: [
  //     {
  //       q: "How does to handle state in React?",
  //       u: "I think useState inside another.",
  //       c: "Consider Redux or Context API for complex apps.",
  //       s: "State Management",
  //     },
  //     {
  //       q: "What is a closure in JavaScript?",
  //       u: "It's like a function inside another.",
  //       c: "A function that remembers its outer scope.",
  //       s: "JS Fundamentals",
  //     },
  //     {
  //       q: "What is REST APIs?",
  //       u: "Used for web services, GET/POST.",
  //       c: "Architectural style for stateless CRUD operations.",
  //       s: "API Design",
  //     },
  //     {
  //       q: "What is writing about a project?",
  //       u: "I made a simple todo list.",
  //       c: "Highlight MERN stack, auth, and integration.",
  //       s: "Project Presentation",
  //     },
  //   ],
  //   sentiment: {
  //     confidence: 90,
  //     professionalism: 70,
  //     clarity: 65,
  //   },
  //   learningPlan: [
  //     { week: "Week 1", topic: "Redux" },
  //     { week: "Week 2", topic: "Context API, Hooks" },
  //     { week: "Week 3", topic: "RESTful API Principles" },
  //     { week: "Week 4", topic: "Project Refinement" },
  //   ],
  //   practiceQuestions: [
  //     {
  //       id: 1,
  //       q: "Implement custom hook for fetching data?",
  //       a: "'useFetch' to centralize loading, error handling.",
  //     },
  //     {
  //       id: 2,
  //       q: "Compare SQL vs. NoSQL for scalability?",
  //       a: "SQL for ACID, NoSQL for horizontal scaling.",
  //     },
  //     {
  //       id: 3,
  //       q: "What are side effects in React?",
  //       a: "Actions like DOM change or API call.",
  //     },
  //     {
  //       id: 4,
  //       q: "Explain JWT Authentication?",
  //       a: "Secure stateless authentication using tokens.",
  //     },
  //     {
  //       id: 5,
  //       q: "What is Middleware in Express?",
  //       a: "Functions that handle Request-Response objects.",
  //     },
  //     {
  //       id: 6,
  //       q: "Explain Virtual DOM.",
  //       a: "Lightweight copy for fast UI updates.",
  //     },
  //     {
  //       id: 7,
  //       q: "What is useEffect?",
  //       a: "Hook for side effects in functional components.",
  //     },
  //     {
  //       id: 8,
  //       q: "Difference between let and var?",
  //       a: "Block scope vs Function scope.",
  //     },
  //     {
  //       id: 9,
  //       q: "What is MongoDB aggregation?",
  //       a: "Data processing pipeline for complex queries.",
  //     },
  //     {
  //       id: 10,
  //       q: "How to optimize React apps?",
  //       a: "Memoization, Lazy loading, and Code splitting.",
  //     },
  //   ],
  // });

  const [interviewResults, setInterviewResults] = useState({
  candidateName: "",
  domain: "",
  difficulty: "",
  interviewType: "",
  scores: {
    resume: { value: 0, label: "" },
    interview: { value: 0, label: "" },
  },
  resumeAnalysis: {
    matchPercentage: 0,
    keySkills: [],
    missingKeywords: "",
    projectImpact: "",
    formattingFeedback: [],
  },
  mistakes: [],
  sentiment: {
    confidence: 0,
    professionalism: 0,
    clarity: 0,
  },
  learningPlan: [],
  practiceQuestions: [],
});

  const sentimentColors = {
    confidence: "#a78bfa",
    professionalism: "#34d399",
    clarity: "#60a5fa",
  };

  const circumference = 2 * Math.PI * 32;

  function ScoreRing({ value, color, label, sublabel }) {
    const offset = circumference - (value / 100) * circumference;
    return (
      <div className="score-card">
        <div className="score-card__label">{label}</div>
        <div className="score-ring">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="32" className="score-ring__bg" />
            <circle
              cx="45"
              cy="45"
              r="32"
              className="score-ring__fill"
              style={{
                stroke: color,
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <div className="score-ring__value">
            {value}
            <span>/100</span>
          </div>
        </div>
        <div className="score-card__sublabel" style={{ color }}>
          {sublabel}
        </div>
      </div>
    );
  }















































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


// const sendMessageToBackend =async(text)=>{
//  try{
//      setIsProcessing(true);
//      const response=await API.post("/interview/chat",{
//       message:text,
//       oldData: messages
//      })


//      const aiReply=response.data.reply;
//      setMessages(prev=>[
//       ...prev,
//       {role:"ai",text:aiReply}
//      ])
//       speakAI(aiReply);

//  }   
//  catch(error){
// console.error("interview chat send error: ",error);
//  }
// finally {
//     setIsProcessing(false);
//   }
// }


const sendMessageToBackend = async (text) => {
  try {
    setIsProcessing(true);
    const response = await API.post("/interview/chat", {
      message: text,
      oldData: messages
    });

    // Backend-லிருந்து வரும் reply மற்றும் animation-ஐப் பிரிக்கிறோம்
    const aiReply = response.data.reply;
    const animationFromAI = response.data.animation; // இது "hi" அல்லது "talk" ஆக இருக்கும்

    // 1. அனிமேஷனை செட் செய்கிறோம்
    setAnimationName(animationFromAI);

    // 2. மெசேஜை செட் செய்கிறோம்
    setMessages(prev => [
      ...prev,
      { role: "ai", text: aiReply }
    ]);

    // 3. AI பேசத் தொடங்குகிறது
    speakAI(aiReply);

  } catch (error) {
    console.error("interview chat send error: ", error);
  } finally {
    setIsProcessing(false);
  }
};




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


const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 3 }); 
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const { data: { text } } = await Tesseract.recognize(
          canvas.toDataURL("image/png"),
          'eng', 
          { 
            tessedit_pageseg_mode: '3' 
          }
        );
        fullText += `--- Page ${i} ---\n${text}\n`;
      }

      const combinedData = {
        resumeContent: fullText.trim(),
        status: "ready", // 🔥 முக்கியம்: எக்ஸ்ட்ராக்ஷன் முடிந்தது
        interviewType: interviewData?.interviewType || "",
        domain: interviewData?.domain || "",
        difficulty: interviewData?.difficulty || "3",
        notes: interviewData?.notes || ""
      };

      setUploadedResume([combinedData]);
      console.log("✅ OCR Extraction Finished!");
    } catch (error) {
      console.error("❌ PDF Extraction Error:", error);
      setUploadedResume([{ status: "error", resumeContent: null }]);
    }
  };
// --- 2. டேட்டாவைப் பிரித்து சேமிக்கும் ஒரே ஒரு useEffect ---
  useEffect(() => {
    if (interviewData) {
      console.log("--- Starting Data Storage Process ---");

      // ✅ 1. Manual Skills (Skills இருந்தால் மட்டும்)
      if (interviewData.skills && interviewData.skills.trim() !== "") {
        console.log("📍 Saving manual skills...");
        setManualType([interviewData.skills]);
      }

      // ✅ 2. PDF Resume (OCR Process)
      if (interviewData.resume) {
        console.log("📍 Processing PDF Resume...");
        setUploadedResume([{ status: "loading", resumeContent: null }]);
        extractPdfText(interviewData.resume);
      }

      // ✅ 3. HTML Resume (Cleaning Process)
      if (interviewData.projectResume) {
        console.log("📍 Cleaning HTML Resume...");
        const htmlPages = Array.isArray(interviewData.projectResume) 
          ? interviewData.projectResume 
          : [interviewData.projectResume];

        let allCleanText = "";

        htmlPages.forEach((page, index) => {
          let rawHtml = page.html_codes || "";
          let cleanPageText = rawHtml
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          allCleanText += `--- Page ${index + 1} ---\n${cleanPageText}\n\n`;
        });

        setHtmlResume([{
          resumeContent: allCleanText.trim(),
          status: "ready",
          interviewType: interviewData.interviewType || "",
          domain: interviewData.domain || "",
          difficulty: interviewData.difficulty || "3",
          notes: interviewData.notes || ""
        }]);
      }
    }
  }, [interviewData]);














// 1. கன்சோல் மற்றும் ஏபிஐ கால் செய்யும் ஒருங்கிணைந்த ஃபங்ஷன்
const syncAndLogInterviewData = async () => {
  console.log("======= 🧐 LIVE DATA TRACKER & SYNC =======");

  const dataSummary = {
    manual: {
      hasData: manualType.length > 0,
      skills: manualType[0] || "No skills added"
    },
    pdf: {
      status: uploadedResume[0]?.status || "Empty",
      contentFound: !!uploadedResume[0]?.resumeContent,
      snippet: uploadedResume[0]?.resumeContent ? uploadedResume[0].resumeContent.substring(0, 100) : "N/A"
    },
    html: {
      status: htmlResume[0]?.status || "Empty",
      contentFound: !!htmlResume[0]?.resumeContent,
      snippet: htmlResume[0]?.resumeContent ? htmlResume[0].resumeContent.substring(0, 100) : "N/A"
    }
  };

  console.table(dataSummary);

  // --- 🔴 பேக்கெண்டிற்கு அனுப்பும் கண்டிஷன் செக் ---
  
  // 1. ஏதாவது ஒரு டேட்டா லோடிங்கில் இருந்தால் அனுப்பாதே (Wait for OCR)
  const isPDFLoading = uploadedResume[0]?.status === "loading";
  if (isPDFLoading) {
    console.log("⏳ PDF இன்னும் ஸ்கேன் ஆகிறது... காத்திருக்கிறேன்.");
    return; 
  }

  // 2. அனுப்ப வேண்டிய முக்கிய டேட்டாக்கள் தயாராக இருக்கிறதா என்று பார்
  const hasManual = manualType.length > 0;
  const hasPDF = uploadedResume[0]?.status === "ready";
  const hasHTML = htmlResume[0]?.status === "ready";

  if (hasManual || hasPDF || hasHTML) {
    try {
      console.log("🚀 All set! Sending final data to backend...");
      
      const payload = {
        resumeInfo: {
          interviewType: interviewData?.interviewType || "General",
          domain: interviewData?.domain || "FullStack",
          difficulty: interviewData?.difficulty || "3",
          notes: interviewData?.notes || "",
          manualSkills: manualType[0] || null,
          resumeContent: uploadedResume[0]?.resumeContent || null,
          projectResume: htmlResume[0]?.resumeContent || null,
        }
      };

      // 🔴 API கால் (உங்கள் API வேரியபிளை பயன்படுத்தவும்)
      const response = await API.post("/interview/store-context", payload);

      if (response.data.success) {
        console.log("✅ Backend received everything!");
        setIsInitialSyncing(false); // லோடிங் ஸ்கிரீனை நிறுத்து
      }
    } catch (error) {
      console.error("❌ Sync failed:", error.message);
      // எரர் வந்தாலும் லோடிங்கை நிறுத்தினால் தான் யூசர் பேஜை பார்க்க முடியும்
      setIsInitialSyncing(false); 
    }
  }

  console.log("====================================");
};

// 2. இந்த ஃபங்ஷனை இயக்கும் அதே useEffect
useEffect(() => {
  if (manualType.length > 0 || uploadedResume.length > 0 || htmlResume.length > 0) {
    syncAndLogInterviewData();
  }
}, [manualType, uploadedResume, htmlResume]);
// 2. இந்த ஃபங்ஷனை இயக்கும் useEffect
useEffect(() => {
  // ஏதாவது ஒரு ஸ்டேட் மாறினால் மட்டும் லாக் செய்யும்
  if (manualType.length > 0 || uploadedResume.length > 0 || htmlResume.length > 0) {
   syncAndLogInterviewData();
  }
}, [manualType, uploadedResume, htmlResume]); // Dependencies














































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






useEffect(() => {
  // இது Cleanup function. 
  // இந்தப் பக்கத்தை விட்டு வேறு பக்கத்திற்கு மாறும்போது இது இயங்கும்.
  return () => {
    // ஒரு சிறிய தாமதத்திற்குப் பிறகு ரீலோட் செய்ய வைப்பது நல்லது
    setTimeout(() => {
      window.location.reload();
    }, 100); 
  };
}, []);

































const getInterviewResults = async () => {
  if (!interviewCompleted) {
    console.log("⚠️ Interview is not completed yet!");
    alert("Please complete the interview before getting results.");
    return;
  }


  try {
    const payload = { chatTranscript: messages };
    const response = await API.post("/auth/interview-results", payload);

    if (response.data.success) {
      // 🎯 இங்கேதான் பேக்கெண்ட் டேட்டா உங்கள் UI Mapping-க்குள் செல்கிறது
      setInterviewResults(response.data.data);
    }
  } catch (error) {
    console.error("❌ UI Sync Error:", error.message);
  }
};




















































const saveAllInterview = async () => {
  try {
    // 1. Check Messages (Chat Data)
    let chatDataToSend = null;
    if (messages && messages.length > 0) {
      chatDataToSend = messages;
    } else {
      console.error("No chat history found");
      return;
    }

    // 2. Check Interview Results
    let resultsToSend = null;
    if (interviewResults && interviewResults.domain) {
      resultsToSend = interviewResults;
    } else {
      console.error("No interview results found");
      return;
    }

    // 3. Check and Convert Video
    let videoBlob = null;
    if (recordedVideo) {
      const response = await fetch(recordedVideo);
      videoBlob = await response.blob();
      console.log("Video ready for upload ✅");
    } else {
      alert("Please wait for video to process or record again.");
      return;
    }

    // 4. Combine everything into FormData
    const formData = new FormData();
    
    // UI-லிருந்து வரும் 3 முக்கியமான டேட்டா
    formData.append("chatData", JSON.stringify(chatDataToSend));
    formData.append("resultSummary", JSON.stringify(resultsToSend));
    formData.append("video", videoBlob, "interview_session.webm");

    // 5. Send to Backend
    // குறிப்பு: userId-ஐ பேக்-எண்ட் 'req.user.id' அல்லது 'req.session' மூலம் எடுத்துக்கொள்ளும்
    const res = await API.post("/save-interview-results", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // if (res.status === 200) {
    //   alert("All interview data saved successfully! 🚀");
    // }
    if (res.status === 200) {
  // 🚀 வெற்றிகரமாகச் சேமிக்கப்பட்டால் சக்சஸ் பேஜிற்கு போகவும்
  navigate('/success-saveinterview'); 
}

  } catch (error) {
    console.error("Save error:", error);
    alert("Error saving interview data. Check console.");
  }
};

// 1. Define the function inside your component
// இது உங்கள் காம்போனெண்டிற்குள் இருக்க வேண்டும்
useEffect(() => {
  if (recognition) {
    // மைக் தானாக நின்றாலோ அல்லது நாம் நிறுத்தினாலோ இந்த ஸ்டேட் மாறும்
    recognition.onend = () => {
      setIsListening(false);
      console.log("🎤 Mic turned off");
    };

    recognition.onstart = () => {
      setIsListening(true);
      console.log("🎤 Mic turned on");
    };
  }
}, [recognition]);


const startListening = () => {
  // மைக் ஆப்ஜெக்ட் இருக்கிறதா மற்றும் ஏற்கனவே மைக் ஓடவில்லையா என்று பார்க்கிறோம்
  if (recognition && !isListening) { 
    try {
      recognition.start();
      // குறிப்பு: இங்கேயே setIsListening(true) போடுவதை விட, 
      // மேலே உள்ள onstart-ல் போடுவது இன்னும் துல்லியமானது.
    } catch (error) {
      console.log("Speech recognition is already active.");
    }
  } else {
    console.log("Recognition attempt skipped because it is already running.");
  }
};

const speakResponse = (text) => {
  // 1. AI பேச ஆரம்பிக்கும் போது மைக்கை நிறுத்தவும்
  if (recognition) {
    recognition.stop(); 
    setIsListening(false);
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.onend = () => {
    console.log("AI finished speaking. Now listening...");
    
    // 2. AI பேசி முடித்த பிறகு ஒரு 500ms கேப் விட்டு ஸ்டார்ட் செய்யவும்
    // இது பிரவுசருக்கு மைக்கை ரீசெட் செய்ய நேரம் கொடுக்கும்
    setTimeout(() => {
      startListening();
    }, 500);
  };

  window.speechSynthesis.speak(utterance);
};

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
  {/* Loading Overlay */}
{isInitialSyncing && (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
    <div className="relative h-20 w-20">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
      {/* Inner Circle */}
      <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin-reverse"></div>
    </div>
    
    <div className="mt-6 text-center">
      <h2 className="text-xl font-semibold text-white tracking-wide">
        Processing Your Profile...
      </h2>
      <p className="mt-2 text-blue-200 text-sm animate-pulse">
        Syncing resume data with AI Context
      </p>
    </div>
  </div>
)}
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





   <div className="dashboard">
      {/* ── Header ── */}
      {interviewResults && Object.keys(interviewResults).length > 0 && (
        <>
      <header className="dashboard__header">
        <div className="dashboard__header-icon">🤖</div>
        <h1>CAREER ANALYSER — MOCK INTERVIEW RESULTS</h1>
        <p>GREAT JOB, {interviewResults.candidateName}!</p>
      </header>

      {/* ── Top Row: Scores + Info ── */}
      <div className="top-row">
        <ScoreRing
          value={interviewResults.scores.resume.value}
          color="#10b981"
          label="RESUME SCORE"
          sublabel={`RESUME STRENGTH: ${interviewResults.scores.resume.label}`}
        />
        <ScoreRing
          value={interviewResults.scores.interview.value}
          color="#f59e0b"
          label="INTERVIEW SCORE"
          sublabel={`OVERALL PERFORMANCE: ${interviewResults.scores.interview.label}`}
        />
        <div className="info-card">
          <div className="section-title">CANDIDATE INFO</div>
          {[
            ["Candidate", interviewResults.candidateName],
            ["Domain", interviewResults.domain],
            ["Difficulty", interviewResults.difficulty],
            ["Type", interviewResults.interviewType],
          ].map(([k, v]) => (
            <div className="info-row" key={k}>
              <span>{k}</span>
              <span className="info-row__value">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Middle: Resume + Sentiment ── */}
      <div className="mid-row">
        {/* Resume Analysis */}
        <div className="section">
          <div className="section-title">RESUME ANALYSIS</div>

          <div className="sub-label">
            KEY SKILLS MATCH ({interviewResults.resumeAnalysis.matchPercentage}%)
          </div>
          <div className="tags">
            {interviewResults.resumeAnalysis.keySkills.map((s) => (
              <span className="tag tag--purple" key={s}>
                {s}
              </span>
            ))}
          </div>

          <div className="missing-block">
            <span className="badge badge--warn">Missing Keywords</span>
            <p className="missing-block__text">
              {interviewResults.resumeAnalysis.missingKeywords}
            </p>
          </div>

          <div className="sub-label" style={{ marginTop: 10 }}>
            PROJECT IMPACT
          </div>
          <p className="bullet-item">
            {interviewResults.resumeAnalysis.projectImpact}
          </p>

          <div className="sub-label" style={{ marginTop: 10 }}>
            FORMATTING FEEDBACK
          </div>
          {interviewResults.resumeAnalysis.formattingFeedback.map((f) => (
            <p className="bullet-item" key={f}>
              {f}
            </p>
          ))}
        </div>

        {/* Sentiment + Learning Plan */}
        <div className="section">
          <div className="section-title">SENTIMENT &amp; COMMUNICATION</div>
          {Object.entries(interviewResults.sentiment).map(([k, v]) => (
            <div className="bar-row" key={k}>
              <div className="bar-row__header">
                <span>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <span>{v}%</span>
              </div>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{
                    width: `${v}%`,
                    background: sentimentColors[k],
                  }}
                />
              </div>
            </div>
          ))}

          <div className="section-title" style={{ marginTop: 18 }}>
            30-DAY LEARNING PLAN
          </div>
          <div className="week-grid">
            {interviewResults.learningPlan.map((w, i) => (
              <div className="week-card" key={i}>
                <div className="week-card__label">{w.week}</div>
                <div className="week-card__topic">{w.topic}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mistake Table ── */}
      <div className="section" style={{ marginBottom: 16 }}>
        <div className="section-title">MISTAKE ANALYSIS TABLE</div>
        <div className="table-wrapper">
          <table className="mistake-table">
            <thead>
              <tr>
                <th>QUESTION ASKED</th>
                <th>YOUR ANSWER</th>
                <th>CORRECT ANSWER</th>
                <th>KEY SKILL</th>
              </tr>
            </thead>
            <tbody>
              {interviewResults.mistakes.map((m, i) => (
                <tr key={i}>
                  <td>{m.q}</td>
                  <td className="td--user">{m.u}</td>
                  <td className="td--correct">{m.c}</td>
                  <td>
                    <span className="tag tag--green">{m.s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Practice Questions ── */}
      <div className="section">
        <div className="section-title">
          NEXT PRACTICE QUESTIONS ({interviewResults.practiceQuestions.length}{" "}
          ITEMS)
        </div>
        <div className="pq-grid">
          {interviewResults.practiceQuestions.map((p) => (
            <div className="pq-item" key={p.id}>
              <div className="pq-item__num">{p.id}</div>
              <div>
                <div className="pq-item__q">{p.q}</div>
                <div className="pq-item__a">{p.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="dashboard__footer">
        CONGRATULATIONS, {interviewResults.candidateName}! INTERVIEW COMPLETE —
        KEEP LEARNING AND PRACTISING TO{" "}
        <span className="footer__highlight">SHINE IN YOUR CAREER!</span>
      </footer>
      </>
      )}
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
      {interviewCompleted && (
      <button 
  className="finish-btn" 
  onClick={getInterviewResults}
  style={{
    padding: '10px 20px',
    backgroundColor: '#8b5cf6', // Purple color like your theme
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }}
>
  GET INTERVIEW RESULTS 🤖
</button>



)}
{/* நிபந்தனை: 
  1. interviewResults-ல் டொமைன் இருக்க வேண்டும் (Result வந்துவிட்டது என அர்த்தம்)
  2. recordedVideo இருக்க வேண்டும் (வீடியோ ரெக்கார்ட் ஆகிவிட்டது என அர்த்தம்)
*/}

{interviewResults.domain && recordedVideo ? (
  <div className="save-action-container" style={{ marginTop: '20px', textAlign: 'center' }}>

   
   
    <button 
      onClick={saveAllInterview} 
      className="save-results-btn"
      style={{
        padding: '12px 25px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
      }}
    >

      💾 Save Interview Results & Video
    </button>
    <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
      Everything is ready! You can now save your session to the cloud.
    </p>
  </div>
) : (
  <div className="waiting-msg" style={{ marginTop: '20px', color: '#e67e22', fontWeight: '500' }}>
    {/* ரிசல்ட் வரும் வரை பயனர் காத்திருக்கச் சொல்கிறோம் */}
    {!interviewResults.domain ? "⏳ Waiting for interview analysis..." : "🎥 Processing recorded video..."}
  </div>
)}

      <div className="btn-group">
    {/* Other buttons */}
    
   
</div>

    </div>

</>



  );
}

export default Screeninterview;
// {
//   "name": "resume-generator-api",
//   "version": "1.0.0",
//   "main": "server.js",
//   "type": "commonjs",
//   "scripts": {
//     "clean:ui": "npx rimraf dist",
//     "build:ui": "cd ../resume-generator-ui && npm run build",
//     "copy:ui": "xcopy ..\\resume-generator-ui\\dist dist /E /I /Y",
//     "ui:update": "npm run clean:ui && npm run build:ui && npm run copy:ui",
//     "watch:ui": "npx chokidar \"../resume-generator-ui/src/**/*\" -c \"npm run ui:update\"",
//     "start": "npx concurrently \"npm run watch:ui\" \"nodemon server.js\""
//   },
//   "dependencies": {
//     "@google/generative-ai": "^0.24.1",
//     "bcrypt": "^6.0.0",
//     "cookie-parser": "^1.4.7",
//     "cors": "^2.8.5",
//     "dotenv": "^17.2.3",
//     "express": "^4.22.1",
//     "express-session": "^1.18.2",
//     "jsonwebtoken": "^9.0.3",
//     "multer": "^2.0.2",
//     "node-fetch": "^3.3.2",
//     "nodemailer": "^7.0.12",
//     "passport": "^0.7.0",
//     "passport-google-oauth20": "^2.0.0",
//     "pg": "^8.16.3"
//   },
//   "devDependencies": {
//     "chokidar-cli": "^3.0.0",
//     "concurrently": "^9.2.1",
//     "nodemon": "^3.1.11",
//     "rimraf": "^5.0.10"
//   }
// }
// "nodemonConfig": {
//   "ignore": ["*.json", "uploads/*"]
// }



















// {
//   "name": "resume-generator-api",
//   "version": "1.0.0",
//   "main": "server.js",
//   "type": "commonjs",
//   "scripts": {
//     "clean:ui": "npx rimraf dist",
//     "build:ui": "cd ../resume-generator-ui && npm run build",
//     "copy:ui": "xcopy ..\\resume-generator-ui\\dist dist /E /I /Y",
//     "ui:update": "npm run clean:ui && npm run build:ui && npm run copy:ui",
//     "watch:ui": "npx chokidar \"../resume-generator-ui/src/**/*\" -c \"npm run ui:update\"",
//     "start": "npx concurrently \"npm run watch:ui\" \"nodemon server.js\""
//   },
//   "dependencies": {
//     "@google/generative-ai": "^0.24.1",
//     "bcrypt": "^6.0.0",
//     "cookie-parser": "^1.4.7",
//     "cors": "^2.8.5",
//     "dotenv": "^17.2.3",
//     "express": "^4.22.1",
//     "express-session": "^1.18.2",
//     "jsonwebtoken": "^9.0.3",
//     "multer": "^2.0.2",
//     "node-fetch": "^3.3.2",
//     "nodemailer": "^7.0.12",
//     "passport": "^0.7.0",
//     "passport-google-oauth20": "^2.0.0",
//     "pg": "^8.16.3"
//   },
//   "devDependencies": {
//     "chokidar-cli": "^3.0.0",
//     "concurrently": "^9.2.1",
//     "nodemon": "^3.1.11",
//     "rimraf": "^5.0.10"
//   },
//   "nodemonConfig": {
//     "ignore": [
//       "*.json",
//       "uploads/*",
//       "dist/*"
//     ]
//   }
// }