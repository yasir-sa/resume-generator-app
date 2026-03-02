import { useRef, useState ,useEffect} from "react";
import "./Screeninterview.css";
import API from "../../api"

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
    const text =
      event.results[event.resultIndex][0].transcript;
console.log("your text:", text)
    setSpeechText(text);
  };

    // ✅ ADD USER MESSAGE TO CHAT

  
  // ⭐ AUTO RESTART LISTENING
  recognition.onend = () => {
    console.log("Recognition ended, restarting...");
      if (isListeningRef.current) {
    console.log("Restarting...");
    recognition.start();
  }
  };
    recognitionRef.current = recognition;
     
  };


 useEffect(() => {
  if (!speechText) return;
  if (isProcessing) return;

  const timer = setTimeout(() => {

    setMessages(prev => [
      ...prev,
      { role: "user", text: speechText }
    ]);

    sendMessageToBackend(speechText);

  }, 400); // small delay

  return () => clearTimeout(timer);

}, [speechText]);

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
      message:text
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
const speakAI = (text) => {

  if (!window.speechSynthesis) return;
  if (!text?.trim()) return;

  // ⭐ STOP LISTENING
  recognitionRef.current?.stop();

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  // ⭐ AFTER AI FINISH → START LISTENING AGAIN
  utterance.onend = () => {
    console.log("AI finished speaking");

    if (isListeningRef.current) {
      recognitionRef.current?.start();
    }
  };

  speechSynthesis.speak(utterance);
};







  // MAIN FUNCTION
  const startInterview = () => {
    startCamera();   // function 1
    startChatbot();
    isListeningRef.current = true;
    recognitionRef.current?.start();
    
    // startListening(); // function 2
  };
  const stopinterview=()=>{
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
   
    <div className="ai-speak-robo">
   
    </div>
        <h1>🎙 AI Interview Assistant</h1>
  </div>


          <div className="chatbot-messages"
           ref={messagesContainerRef}>
  {messages.map((msg, index) => (
    <div
      key={index}
      className={msg.role === "ai" ? "ai-message" : "user-message"}
    >
      {msg.text}
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
