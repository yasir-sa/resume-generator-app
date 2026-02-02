import './App.css';
import Chatbox from './components/chatbox/Chatbox';
import Home from './components/homepage/home';
import Loginform from './components/loginform/Loginform';
import Product from './components/productpage/Product';
import Register from './components/registerfrom/Register';
import { Routes, Route } from "react-router-dom";
import Resumedetails from './components/resume-details-filpage/Resumedetails';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Loginform />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/chatbox" element={<Chatbox />} />
        <Route path="/resume-creator" element={<Resumedetails />} />
      </Routes>
    </>
  );
}

export default App;
