import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();

const Login = () => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener in App.js will handle the redirect
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Chat App</h1>
        <button
          onClick={handleSignIn}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center mx-auto"
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56,12.25C22.56,11.47 22.49,10.72 22.36,10H12V14.5H18.34C18.05,16.03 17.2,17.34 15.96,18.19V20.75H19.89C21.73,19.03 22.56,16.33 22.56,12.25Z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
