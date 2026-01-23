import React, { useState, useEffect } from 'react'
import "./chatbox.css"
import { FaBars, FaPaperPlane, FaPlus, FaHome } from "react-icons/fa";
import API from "../../api.js"
import { Link } from "react-router-dom";

const Chatbox = () => {

  const [userask, setuserask] = useState("");
  const [menu, setmenu] = useState(false);
  const [newbtn, setnewbtn] = useState(false);
  const [Title, setTitle] = useState("");
  const [menuTitles, setMenuTitles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [titleid, settitleid] = useState(null);

  /* ---------------- MENU ---------------- */
  const setting = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setmenu(prev => !prev);
    getMenuTitles();
  };

  const newchat = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setnewbtn(prev => !prev);
  };

  // click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      const menuElement = document.querySelector(".menu-container");
      if (menuElement && !menuElement.contains(e.target) && !e.target.classList.contains("menu")) {
        setmenu(false);
        setnewbtn(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ---------------- MENU TITLES ---------------- */
  const getMenuTitles = async () => {
    try {
      const res = await API.get("/getTitles");
      setMenuTitles(res.data);
    } catch (err) {
      console.error("Error fetching titles", err);
    }
  };

  useEffect(() => {
    getMenuTitles();
  }, []);

  /* ---------------- CREATE NEW CHAT ---------------- */
  const createnewchat = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!Title.trim()) {
      alert("Please fill input");
      return;
    }

    try {
      const res = await API.post("/create/newchat", { title_name: Title });
      setTitle("");
      await getMenuTitles();
      alert(res.data.message);
    } catch (error) {
      console.error("New chat error", error);
    }
  };

  /* ---------------- GET CHAT MESSAGES ---------------- */
  const getChattingData = async (chattitle_id) => {
    settitleid(chattitle_id);

    try {
      const res = await API.get(`/getChatMessages/${chattitle_id}`);
      setChatMessages(res.data);
    } catch (error) {
      console.error("Chat fetch error", error);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!userask.trim() || !titleid) {
      alert("Title select pannunga + message type pannunga");
      return;
    }

    try {
      await API.post(
        "/send-message",
        {
          chattitle_id: titleid,
          message: userask
        },
        { withCredentials: true }
      );

      // 🔥 instant UI refresh
      await getChattingData(titleid);

      // input clear
      setuserask("");

    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="chat-bot">

        <div className="menu" onClick={setting}>
          <FaBars size={30} />
        </div>

        {menu && (
          <div className="menu-container">

            <div className="newchat-item">
              <button className='newchat-btn' onClick={newchat}>
                <FaPlus /> <span>New chat</span>
              </button>

              {newbtn && (
                <div className="newinput-box" onClick={(e) => e.stopPropagation()}>
                  <input
                    placeholder='type something'
                    value={Title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <button className='new-chat-create-btn' onClick={createnewchat}>
                    New chat Create
                  </button>
                </div>
              )}
            </div>

            <div className="menu-content">
              {menuTitles.length === 0 ? (
                <p>No chats found</p>
              ) : (
                menuTitles.map(item => (
                  <div
                    key={item.chattitle_id}
                    className="chat-title"
                    onClick={() => getChattingData(item.chattitle_id)}
                  >
                    <h1>{item.title_name}</h1>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="header">
          <Link to="/product">
            <FaHome size={24} className='home-icon' />
          </Link>
          <h1>AI career analyser</h1>
        </div>

        <div className="chat-container">
          {chatMessages.length === 0 ? (
            <p className="no-messages">No messages yet</p>
          ) : (
            chatMessages.map((msg, index) => (
              <div key={index} className="chat-pair">

                <div className="chat-row right">
                  <div className="chat-bubble user">
                    <div className="message-text">{msg.user_question}</div>
                    <div className="message-time">
                      {new Date(msg.created_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                <div className="chat-row left">
                  <div className="chat-bubble gemini">
                    <div className="message-text">{msg.gemini_answer}</div>
                    <div className="message-time">
                      {new Date(msg.created_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        <div className="input-container">
          <input
            placeholder='send your question'
            value={userask}
            onChange={(e) => setuserask(e.target.value)}
            className='input-box'
          />

          <button className='send-btn' onClick={sendMessage}>
            <FaPaperPlane size={30} />
          </button>
        </div>

      </div>
    </>
  );
};

export default Chatbox;
