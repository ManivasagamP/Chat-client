import React, { useContext } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = React.useState('signUp');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [bio, setBio] = React.useState("");
  const [isDataSubmitted, setIsDataSubmitted] = React.useState(false);

  const {login} = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    if(currentState === "signUp" && !isDataSubmitted){
      setIsDataSubmitted(true);
      return;
    }

    const logged = login(currentState === "signUp" ? "signup" : "login", {fullName, email, password, bio});
    if(logged) {
      //redirect to home page
      navigate("/");
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl '>
      {/*Left*/}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

      {/*Right*/}
      <form onSubmit={onSubmitHandler} className='vorder-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-mediumtest-2xl flex justify-between items-center'>
          {currentState === "signUp" ? "Sign Up" : "Login"}
          {isDataSubmitted && 
          <
            img
            onClick={() => setIsDataSubmitted(false)}
            src={assets.arrow_icon} alt="" className='w-5 cursor-pointer' 
          />}
        </h2>

        {currentState === "signUp" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text" placeholder='Enter your Full name' className='p-2 border border-gray-500 rounded-md focus:outline-none' required
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email" placeholder='Enter your e-mail...' className='p-2 border border-gray-500 rounded-md focus:outline-none' required
            />
            <input type="password" placeholder='Enter your password...' className='p-2 border border-gray-500 rounded-md focus:outline-none' required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </>
        )}

        {currentState === "signUp" && isDataSubmitted && (
          <textArea rows={4}
            className='p-2 border border-gray-500 rounded-md focus:outline-none'
            placeholder='Tell us about yourself...'
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
          >

          </textArea>
        )}

        <button
          type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currentState === "signUp" ? "Create Account" : "Login now"}
        </button>

        <div className='flex items-center gap-2 text-sm twxt-gray-500'>
          <input type="checkbox" />
          <p>Agree to the terms od use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currentState === "signUp" ? (
            <p
              className='text-gray-500 text-sm'
            >Already have an account? <span className='font-medium text-violet-500 cursor-pointer' onClick={() => { setCurrentState("login"); setIsDataSubmitted(false) }}>Login here</span></p>
          ) : (
            <p
              className='text-gray-500 text-sm'
            >Create an account <span className='font-medium text-violet-500 cursor-pointer' onClick={() => { setCurrentState("signUp") }}>Click here</span></p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage 