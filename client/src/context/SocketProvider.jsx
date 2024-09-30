import React, { createContext, useContext, useMemo, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return socket;
}

const SocketProvider = ({ children }) => {
    const socket = useMemo(() => io("https://vision-meet-server.vercel.app/"), []);

    useEffect(() => {
        return () => {
            socket.disconnect(); // Clean up the socket connection on unmount
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
