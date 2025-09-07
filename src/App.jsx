import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import  HomePage  from "./pages/HomePage.jsx"
import  LoginPage  from './pages/LoginPage.jsx'
import  ProfilePage  from './pages/ProfilePage.jsx'
import { Toaster } from "react-hot-toast"
import { useEffect, useState } from 'react'

const App=() => {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("isAuth");
    setAuthUser(user);
  },[])

  console.log("authUser in App.jsx >>>",authUser);

  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
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
