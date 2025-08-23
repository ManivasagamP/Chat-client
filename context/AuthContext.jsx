import { createContext, useState, useEffect } from "react";
import axios from "axios"
import { toast } from "react-hot-toast";
import {io} from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);
    const [socket, setSocket] = useState(null);

    //Check auth first
    const checkAuth = async () => {
        try {
            const {data} = axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    } 

    //Login function to handle user authentication and socket connection
    const login = async(state, credentials) => {
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token)
                toast.success(data.message)
            }
            else {
                 toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    } 

    //connect socket function too handle socket connection and online users updates
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });

        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        })
    }


    useEffect(() => {
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth()
    },[])
  

    const value = {

    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}