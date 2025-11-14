import React from 'react';

interface MockEmailProps {
  email: {
    to: string;
    code: string;
  };
  onClose: () => void;
}

const MockEmail: React.FC<MockEmailProps> = ({ email, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-lg w-full text-white font-sans animate-slide-up">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-300">Mock Inbox</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="Close email"
          >
            &times;
          </button>
        </header>
        <div className="p-5 space-y-4">
          <div className="text-sm">
            <span className="font-bold text-gray-400 w-16 inline-block">From:</span>
            <span>secure-payments@agent.inc</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-gray-400 w-16 inline-block">To:</span>
            <span>{email.to}</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-gray-400 w-16 inline-block">Subject:</span>
            <span>Your Verification Code</span>
          </div>
          <div className="border-t border-gray-700 my-4"></div>
          <div className="text-base text-gray-200">
            <p className="mb-4">Hello,</p>
            <p className="mb-4">
              Your one-time verification code is below. Please enter this code in the chat to complete your purchase.
            </p>
            <div className="text-center my-6">
              <span className="bg-gray-900 text-indigo-400 text-3xl font-bold tracking-widest p-4 rounded-md inline-block border border-gray-600">
                {email.code}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              If you did not request this code, you can safely ignore this message.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MockEmail;
