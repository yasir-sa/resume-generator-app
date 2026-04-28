




import './App.css';
import GlobalUrlGuard from "./components/GlobalUrlGuard";
import Chatbox from './components/chatbox/Chatbox';
import Home from './components/homepage/Home';
import Loginform from './components/loginform/Loginform';
import Product from './components/productpage/Product';
import Register from './components/registerfrom/Register';
import { Routes, Route } from "react-router-dom";
import Resumedetails from './components/resume-details-filpage/Resumedetails';
import Screeninterview from './components/Screeninterview/Screeninterview';
import SuccessInterview from './components/successinterview/SuccessInterview';
import CompletedMock from './components/completemock/CompletedMock';
import JobSearch from './components/jopapply/JobSearch';

function App() {
  return (
    <>
     <GlobalUrlGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Loginform />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/chatbox" element={<Chatbox />} />
        <Route path="/resume-creator" element={<Resumedetails />} />
        <Route path="/interview-screen" element={<Screeninterview/>}/>
        <Route path="/success-saveinterview" element={<SuccessInterview />} />
        <Route path="/completed-mocks" element={<CompletedMock />} />
        <Route path="/apply-jobs" element={<JobSearch />} />
      </Routes>
    </>
  );
}

export default App;

// {
//   "name": "resume-generator-all",
//   "version": "1.0.0",
//   "scripts": {
//     "build": "cd resume-generator-ui && npm install && npm run build",
//     "install-backend": "cd resume-generator-api && npm install",
//     "start": "cd resume-generator-api && node server.js"
//   }
// }



//ui 
// {
//   "name": "resume-generator-ui",
//   "private": true,
//   "version": "0.0.0",
//   "type": "module",
//   "scripts": {
//     "dev": "vite",
//     "build": "vite build",
//     "lint": "eslint .",
//     "preview": "vite preview"
//   },
//   "dependencies": {
//     "@react-three/drei": "^10.7.7",
//     "@react-three/fiber": "^9.5.0",
//     "axios": "^1.13.2",
//     "canvas-confetti": "^1.9.4",
//     "html2canvas": "^1.4.1",
//     "js-cookie": "^3.0.5",
//     "jspdf": "^4.1.0",
//     "lucide-react": "^0.577.0",
//     "pdfjs-dist": "^5.6.205",
//     "react": "^19.2.0",
//     "react-dom": "^19.2.0",
//     "react-icons": "^5.5.0",
//     "react-router-dom": "^7.12.0",
//     "tesseract.js": "^7.0.0",
//     "three": "^0.183.2"
//   },
//   "devDependencies": {
//     "@vitejs/plugin-react": "^5.1.1",
//     "vite": "^7.2.4"
//   }
// }
