import { createContext, useState, useEffect } from "react";
import axios from "axios"
import { toast } from "react-hot-toast";
import { io } from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    //Check auth first
    const checkAuth = async () => {
        try {
            if (!token) {
                setLoading(false);
                return;
            }
            
            const { data } = await axios.get("/api/auth/check");
            // console.log("data >>>",data);
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.log(error.message);
            // Clear invalid token
            localStorage.removeItem("token");
            setToken(null);
            axios.defaults.headers.common["token"] = null;
        } finally {
            setLoading(false);
        }
    }

    //Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            console.log("Login data >>>",data);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                setToken(data.token);
                localStorage.setItem("token", data.token)
                localStorage.setItem("isAuth", true)
                axios.defaults.headers.common["token"] = data.token;
                toast.success(data.message)
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //Logout function to handle user logout and socket disconnection
    const logout = async() => {
        try {
            localStorage.removeItem("token");
            setToken(null);
            setAuthUser(null);
            setOnlineUsers(null);
            axios.defaults.headers.common["token"] = null;
            toast.success("Logout successful");
            socket.disconnect();
        } catch (error) {
            toast.error(error.message);
        }
    }

    //update profile function to handle user profile updates
    const updateProfile = async(body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body)
            if (data.success) {
                setAuthUser(data.userData);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error("Error:",error.message);
        }
    }

    //connect socket function too handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

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
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth()
    }, [token])


    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        loading,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider };