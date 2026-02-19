import { useRef, useState } from "react";
import "./Screeninterview.css";

function Screeninterview() {

  const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  // const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recordedVideo, setRecordedVideo] = useState(null);
  const recognitionRef = useRef(null);
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

   stopListening();


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
  };

  // MAIN FUNCTION
  const startInterview = () => {
    startCamera();   // function 1
    startChatbot(); 
    startListening(); // function 2
  };
  const stopinterview=()=>{
    stopcamara();


  }



  const startListening = () => {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  // ⭐ FAST SETTINGS
  recognition.continuous = true;      // stop ஆகாம listen
  recognition.interimResults = true;  // LIVE text (fast)
  recognition.lang = "en-US";

  recognitionRef.current = recognition;

  recognition.onresult = (event) => {

    let liveText = "";

    // latest speech collect
    for (let i = event.resultIndex; i < event.results.length; i++) {
      liveText += event.results[i][0].transcript;
    }

    console.log("Live:", liveText);
  };

  recognition.start();
};
const stopListening = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }
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
          Chatbot Area
        </div>
        {recordedVideo && (  <div className="prview-video-container">
          {recordedVideo && (
    <video controls src={recordedVideo}></video>
  )}

          <button className="preview-video-download-btn">download</button>
       
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
