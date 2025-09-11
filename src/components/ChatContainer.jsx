import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { chatContext } from '../../context/chatContext';
import { AuthContext } from '../../context/AuthContext';
import { compressImage, validateImageFile, formatFileSize } from '../utils/imageUtils';
import { toast } from 'react-hot-toast';

const ChatContainer = () => {

  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(chatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  // Handle send message 
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;

    await sendMessage({ text: input.trim() });
    setInput("");
  }

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate the image file
    const validation = validateImageFile(file, 500); // 500KB max size for initial check
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      // Compress the image before sending
      const compressedImage = await compressImage(file, 800, 800, 0.8, 200); // 200KB target size

      // Send the compressed image
      await sendMessage({ image: compressedImage });
      e.target.value = "";
    } catch (error) {
      toast.error("Failed to process image. Please try again.");
      console.error("Image processing error:", error);
    }
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages.length > 0) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages])

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover" />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
        <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>

      {/* Chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => {
          const isOwnMessage = msg?.senderId === authUser._id;
          return (
            <div key={index} className={`flex items-end gap-2 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {!isOwnMessage && (
                <div className='text-center text-xs'>
                  <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <p className='text-gray-500'>{formatMessageTime(msg?.createdAt)}</p>
                </div>
              )}

              {msg?.image ? (
                <img src={msg.image} alt="" className={`max-w-[230px] border border-gray-700 rounded-lg overflow-hidden ${isOwnMessage ? 'rounded-br-none' : 'rounded-bl-none'}`} />
              ) : (
                <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all text-white ${isOwnMessage
                    ? 'bg-violet-500/30 rounded-br-none'
                    : 'bg-gray-600/30 rounded-bl-none'
                  }`}>
                  {msg?.text ?? "Message Corrupted"}
                </p>
              )}

              {isOwnMessage && (
                <div className='text-center text-xs'>
                  <img src={authUser?.profilePic || assets.avatar_icon} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <p className='text-gray-500'>{formatMessageTime(msg?.createdAt)}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/2 px-3 rounded-full'>
          <input onChange={(e) => setInput(e.target.value)} value={input} onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder='Enter your message...' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' />
          <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpg, image/jpeg' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
      </div>

    </div>
  ) : (
    <div className=' flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} alt="" className='max-w-16' />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer