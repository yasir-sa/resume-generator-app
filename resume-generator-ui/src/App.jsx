import './App.css';
import Home from './components/homepage/home';
import Loginform from './components/loginform/Loginform';
import Product from './components/productpage/Product';
import Register from './components/registerfrom/Register';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Loginform />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
      </Routes>
    </>
  );
}

export default App;
