
import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setError(null);
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            setError("Failed to sign in with Google. Please try again.");
        }
    };

    return (
        <div className="bg-gray-900 text-white flex flex-col h-screen font-sans items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-indigo-400 mb-2">Agentic Checkout</h1>
                <p className="text-lg text-gray-400 mb-8">Sign in to start your shopping experience.</p>
                <button
                    onClick={handleGoogleSignIn}
                    className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M24 9.5c3.23 0 5.93 1.09 7.83 2.89l5.96-5.96C34.33 3.32 29.56 1.5 24 1.5 15.3 1.5 7.96 6.32 4.61 13.22l6.83 5.31C13.22 13.04 18.23 9.5 24 9.5z"/>
                        <path fill="#34A853" d="M46.39 24.5c0-1.63-.15-3.2-.42-4.69H24v8.88h12.56c-.54 2.87-2.14 5.3-4.59 6.94l6.83 5.31c3.96-3.66 6.59-8.99 6.59-15.44z"/>
                        <path fill="#FBBC05" d="M11.44 28.53c-.5-.95-.79-2.03-.79-3.13s.29-2.18.79-3.13l-6.83-5.31C2.92 19.95 1.5 22.9 1.5 26.4c0 3.5.92 6.45 2.61 9.56l6.83-5.31z"/>
                        <path fill="#EA4335" d="M24 46.5c4.59 0 8.52-1.53 11.37-4.15l-6.83-5.31c-1.53 1.02-3.48 1.63-5.54 1.63-5.77 0-10.78-3.54-12.56-8.5l-6.83 5.31C7.96 41.68 15.3 46.5 24 46.5z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Sign in with Google
                </button>
                {error && <p className="text-red-400 mt-6">{error}</p>}
            </div>
        </div>
    );
};

export default Login;