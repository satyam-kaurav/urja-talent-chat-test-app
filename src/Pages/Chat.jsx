import React, { useEffect, useState } from "react";
import "../styles/Chat.css";
import { createConvo, getConvoList, getMessages } from "../Apies";
import { io } from "socket.io-client";

const serve_url = "http://localhost:4000";

const role_Arr = [
  { text: "Admin", value: "ADMIN" },
  { text: "Operation", value: "OPERATION" },
  { text: "Account", value: "ACCOUNT" },
  { text: "Teacher", value: "TEACHER" },
  { text: "Parent", value: "PARENT" },
];

export default function Chat({ user }) {
  const [socket, setSocket] = useState(null);
  const [convos, setConvos] = useState([]);
  const [currentConvo, setCurrentConvo] = useState({});
  const [chats, setChats] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Handle conversation selection
  async function handleSelectConvo(convo) {
    if (!convo || !convo._id) {
      console.log("Selected conversation is invalid:", convo);
      return;
    }

    setCurrentConvo(convo);
    try {
      const messages = await getMessages(user.token, convo._id);
      setChats(messages);
    } catch (error) {
      setErrorMsg("Failed to load messages");
    }
  }

  // Handle sending a message
  async function handleSendMessage(e) {
    e.preventDefault();
    const text = e.target["message-text"].value;
    if (!text.trim() || !currentConvo._id) return;

    try {
      socket.emit("send-message", {
        convo_id: currentConvo._id,
        message: text,
      });
    } catch (error) {
      console.log(error);
    }

    e.target.reset(); // Reset input field after sending
  }

  // Handle creating a new conversation
  async function handleCreateConvo(e) {
    e.preventDefault();
    const id = e.target.id.value;
    const role = e.target.role.value;

    try {
      const new_convo = await createConvo(user.token, { id, role });
      if (new_convo) setConvos((prevConvos) => [...prevConvos, new_convo]);
    } catch (error) {
      console.log(error);
    }
  }

  // Setting up socket connection and events
  useEffect(() => {
    const socketInstance = io(serve_url, {
      auth: { token: user.token },
    });

    // Listen for new messages
    socketInstance.on("new-message", (data) => {
      console.log("Received new message:", data);
      const { conversation, msg: message } = data;

      if (!conversation || !message) {
        console.log("Invalid data received 1:", data);
        return;
      }

      setConvos((prevConvos) =>
        prevConvos.map((convo) =>
          convo._id === conversation._id
            ? {
                ...convo,
                last_msg: message.text,
                unread_count: convo.unread_count + 1,
              }
            : convo
        )
      );

      if (currentConvo._id === conversation._id) {
        setChats((prevChats) => [...prevChats, message]);
      }
    });

    // Handle message sent confirmation
    socketInstance.on("message-sent", (data) => {
      console.log("Message sent confirmation:", data);
      const { conversation: convo, msg: message } = data;
      if (!convo || !message) {
        console.log("Invalid data received:", data);
        return;
      }
      setChats((prevChats) => [...prevChats, message]);

      setConvos((prevConvos) =>
        prevConvos.map((c) => (c._id === convo._id ? convo : c))
      );
    });

    // Handle errors
    socketInstance.on("error", (err) => {
      setErrorMsg(err.message);
      console.log("Error:", err);
    });

    setSocket(socketInstance);

    // Fetch conversations on mount
    getConvoList(user.token).then((data) => {
      if (data) {
        console.log("Fetched conversations:", data);
        setConvos(data);
      } else {
        console.log("Failed to fetch conversations.");
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user.token, currentConvo._id]);

  return (
    <div className="container">
      <div className="user-info">{/* Add user details here */}</div>

      <div className="main-panel">
        <div className="convo-list">
          {convos && convos.length > 0 ? (
            convos.map((convo) => (
              <div
                className="convo"
                key={convo._id}
                onClick={() => handleSelectConvo(convo)}
              >
                <span>
                  {convo.other_user.user_name} (
                  {convo.other_user.user_role.toLowerCase()})
                </span>
                <span>
                  {convo.unread_count > 0 && `Unread: ${convo.unread_count}`}
                </span>
                <span>{convo.last_msg}</span>
              </div>
            ))
          ) : (
            <p>No conversations available.</p>
          )}
        </div>

        <div className="chat-panel">
          {chats && chats.length > 0 ? (
            chats.map((message, index) => (
              <div
                key={index}
                className={`message-bubble-${
                  message.sender_id === user._id ? "self" : "other"
                }`}
              >
                <p>{message.text}</p>
              </div>
            ))
          ) : (
            <p>No messages in this conversation.</p>
          )}
        </div>
      </div>

      <div className="user-action">
        <form onSubmit={handleSendMessage}>
          <input
            name="message-text"
            required
            type="text"
            placeholder="Type your message"
          />
          <button type="submit">Send</button>
        </form>

        <form onSubmit={handleCreateConvo}>
          <input type="text" name="id" placeholder="Enter user ID" />
          <select name="role">
            {role_Arr.map((item, index) => (
              <option key={index} value={item.value}>
                {item.text}
              </option>
            ))}
          </select>
          <button type="submit">Create</button>
        </form>

        {errorMsg && <div className="error-message">{errorMsg}</div>}
      </div>
    </div>
  );
}
