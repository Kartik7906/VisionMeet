import React, { useEffect } from "react";
import { useState, useCallback } from "react";
import {useSocket} from '../context/SocketProvider';
import {useNavigate} from 'react-router-dom';

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();



  const handleSubmitform = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', {email, room});
  }, [email,room, socket]);


  const handlejoinroom = useCallback((data)=>{
    const {email, room} = data
    navigate(`/room/${room}`);
  },[navigate]);

  useEffect(()=>{
    socket.on('room:join', handlejoinroom);
    return ()=>{
      socket.off('room:join', handlejoinroom);
    }
  },[socket, handlejoinroom]);

  return (
    <div className="container">
          <div className="lobbycontainer">
      <h1 className="lobbyheading">Welcome to Your Lobby</h1>
      <form onSubmit={handleSubmitform}>
        {/* email input */}
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <br />

        {/* room code here: */}
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => {
            setRoom(e.target.value);
          }}
        />
        <br />
        
        <button>Join</button>
      </form>
    </div>
    </div>
  );
};

export default Lobby;
