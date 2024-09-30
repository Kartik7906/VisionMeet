import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/Peer";

const Room = () => {
  const socket = useSocket();
  const [remotesocketid, setRemotesocketid] = useState(null);
  const [mystream, setMystream] = useState(null); // Initialize state as null
  const [remoteStream, setRemoteStream] = useState(null); // Initialize state as null

  const handleuserjoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemotesocketid(id);
  }, []);

  const handlecalluser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remotesocketid, offer });
    setMystream(stream);
  }, [remotesocketid, socket]);

  const handleincommingcall = useCallback(
    async ({ from, offer }) => {
      setRemotesocketid(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMystream(stream);
      const ans = await peer.getanswer(offer); // Fix method name to `getAnswer`
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
    }
  }, [mystream]);

  const handlecallaccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted:");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remotesocketid });
  }, [remotesocketid, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getanswer(offer); // Fix method name to `getAnswer`
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams[0]; // Access the first stream
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleuserjoined);
    socket.on("incomming:call", handleincommingcall);
    socket.on("call:accepted", handlecallaccepted); // Fix method name
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleuserjoined);
      socket.off("incomming:call", handleincommingcall);
      socket.off("call:accepted", handlecallaccepted); // Fix method name
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleuserjoined,
    handleincommingcall,
    handlecallaccepted, // Fix method name
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="roompagecontainer">
      <h1>This is my room page:</h1>
      <h4>{remotesocketid ? "connected" : "No one in room"}</h4>
      {mystream && <button onClick={sendStreams}>Send Stream</button>}

      {remotesocketid && <button onClick={handlecalluser}>Call</button>}
      <div className="streamsconstiner">
      <div className="leftstreamcontainer">
      {mystream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            url={mystream}
          />
        </>
      )}
      </div>

      <div className="rightstreamconatiner">
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            url={remoteStream}
          />
        </>
      )}
      </div>
      </div>
    </div>
  );
};

export default Room;
