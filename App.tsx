
import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import ShoppingPage from './components/ShoppingPage';

const App: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="bg-gray-900 text-white flex flex-col h-screen font-sans items-center justify-center">
                <div className="loader"></div>
                <p className="mt-4 text-gray-400">Loading Session...</p>
                 <style>{`
                    .loader {
                        border: 4px solid #4a5568; /* gray-700 */
                        border-top: 4px solid #6366f1; /* indigo-500 */
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return user ? <ShoppingPage user={user} /> : <Login />;
};

export default App;