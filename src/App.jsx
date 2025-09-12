import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import  HomePage  from "./pages/HomePage.jsx"
import  LoginPage  from './pages/LoginPage.jsx'
import  ProfilePage  from './pages/ProfilePage.jsx'
import { Toaster } from "react-hot-toast"
import { useEffect, useState } from 'react'
import { AuthContext } from "../context/AuthContext.jsx";
import bgImage from "./assets/bgImage.svg";

const App=() => {
  
  const {authUser, loading} = useContext(AuthContext);

  if (loading) {
    return (
      <div className="bg-contain min-h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-contain"
      style={{ backgroundImage: `url(${bgImage})`}}>
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={"/login"} /> } />
      </Routes>
    </div>
  )
}

export default App 
