import './App.css';
import Chatbox from './components/chatbox/Chatbox';
import Home from './components/homepage/home';
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
