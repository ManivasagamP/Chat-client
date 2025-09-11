import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";


export const chatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState([]);

    const { socket, axios } = useContext(AuthContext)

    //function to get all users
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected users
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            console.log("came here")
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,
                messageData
            );
            console.log(data)
            if (data.success) {
                // Add message immediately for sender (since socket only goes to receiver)
                setMessages((prevMessages) => [...prevMessages, data.message])
                console.log("Message sent successfully")
            }else{
                toast.error(data.message || "Failed to send message")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if(!socket) return;

        socket.on("newMessage", (newMessage)=> {
            if(selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)){
                // This is a message in the current conversation
                newMessage.seen = true;
                setMessages((prevMessages) => {
                    // Check if message already exists to prevent duplicates
                    const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
                    if (messageExists) return prevMessages;
                    return [...prevMessages, newMessage];
                });
                axios.put(`api/messages/mark/${newMessage._id}`);
            }else{
                // This is a message from another conversation
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //function to unsubscribe form the messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket, selectedUser])

    const value = {
        messages,
        users,
        selectedUser,
        getMessages,
        getUsers,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }

    return (
        <chatContext.Provider value={value}>
            {children}
        </chatContext.Provider>
    )
}