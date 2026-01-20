import React, { useState, useEffect } from 'react'
import "./chatbox.css"
import { FaBars, FaPaperPlane, FaPlus } from "react-icons/fa";
import API from "../../api.js"
import { FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";

const Chatbox = () => {

    const [userask,setuserask]=useState("")
    const [menu,setmenu]=useState(false)
    // const menuTitles = ["Profile", "Settings", "Messages", "Notifications", "Logout"];
    const [newbtn,setnewbtn]=useState(false)
    const [Title,setTitle]=useState("")
    const [menuTitles,setMenuTitles]=useState([])

    const setting=(e)=>{
        e.preventDefault();
        e.stopPropagation(); // prevent bubble
        // alert("hi pro now chat pot ui finished ")
        setmenu((prev)=>!prev)
         getMenuTitles();
    }

    const newchat=(e)=>{
        e.preventDefault();
        e.stopPropagation(); // prevent bubble
        setnewbtn((prev)=>!prev)
    }

    // click outside menu close
    useEffect(()=>{
        const handleClickOutside=(e)=>{
            const menuElement = document.querySelector(".menu-container")
            // menu container exists and click target outside menu AND not menu icon
            if(menuElement && !menuElement.contains(e.target) && !e.target.classList.contains("menu")){
                setmenu(false)
                setnewbtn(false)
            }
        }
        document.addEventListener("click", handleClickOutside)
        return ()=> document.removeEventListener("click", handleClickOutside)
    },[])


  const getMenuTitles = async () => {
    try {
      const res = await API.get("/getTitles");
      const titles = res.data.map(item => item.title_name);
      setMenuTitles(titles);
      console.log("Fetched titles:", titles);
    } catch (err) {
      console.error("Error fetching titles", err);
    }
  };


 useEffect(() => {
    getMenuTitles();
  }, []);
  const createnewchat = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!Title.trim()) {
      alert("Please fill input");
      return;
    }

    try {
      const res = await API.post("/create/newchat", { title_name: Title });
      console.log("Created chat response:", res);
      setTitle("");

      // ✅ Call getMenuTitles to refresh UI immediately
      await getMenuTitles();

      alert(res.data.message);
    } catch (error) {
      console.error("New chat send error", error);
    }
  };



  return (
    <>
      <div className="chat-bot">
        <div className="menu" onClick={setting} > <FaBars size={30} /></div>
       
          {menu && (
            <div className="menu-container">
                  <div className="newchat-item">
                       <button className='newchat-btn' onClick={newchat}>
                        <FaPlus /> <span>New chat</span>
                       </button>
                       {newbtn &&(
                        <div className="newinput-box" onClick={(e)=> e.stopPropagation()}>
                            <input
                            placeholder='type somthing'
                            value={Title}
                            onChange={(e)=> setTitle(e.target.value)}  
                            />                            
                            <button className='new-chat-create-btn ' onClick={createnewchat}>New chat Create</button>
                        </div>
                       )}
                  </div>
                 <div className="menu-content">
            {menuTitles.length === 0 ? (
        <p>No chats found</p>
      ) : (
        menuTitles.map((title, index) => (
          <div className="chat-title" key={index}>
            <h1>{title}</h1>
          </div>
        ))
      )}
        </div>
            </div>
       
      )}
       
        <div className="header">
            <Link to="/product">
             <FaHome size={24}  className='home-icon'/>
             </Link>
             
            <h1>AI career analyser</h1>
            </div>

        <div className="chat-container">

        </div>
        <div className="input-container">
            <input  
            placeholder='send your question'
            value={userask}
            onChange={(e)=> setuserask(e.target.value)}
            name='usermessage'
            className='input-box'
            />

            <button className='send-btn'>
                
                 <FaPaperPlane  size={30}  />
            </button>

        </div>
      </div>
    </>
  )
}

export default Chatbox
