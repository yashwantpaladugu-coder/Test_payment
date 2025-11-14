
import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface ChatInputProps {
    onSubmit: (input: string) => void;
    disabled: boolean;
    placeholder: string;
    error?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, disabled, placeholder, error }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSubmit(input.trim());
            setInput('');
        }
    };

    return (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <SendIcon />
                </button>
            </form>
             {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>
    );
};

export default ChatInput;
