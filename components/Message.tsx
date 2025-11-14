
import React from 'react';
import { Message as MessageType, Role } from '../types';
import Agent1Icon from './icons/Agent1Icon';
import Agent2Icon from './icons/Agent2Icon';
import UserIcon from './icons/UserIcon';

interface MessageProps {
    message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === Role.USER;
    const isAgent1 = message.role === Role.AGENT_1;
    const isAgent2 = message.role === Role.AGENT_2;
    const isSystem = message.role === Role.SYSTEM;

    if (isSystem) {
        return (
            <div className="text-center text-sm text-gray-400 italic my-2">
                {message.content}
            </div>
        );
    }

    const Icon = isUser ? UserIcon : isAgent1 ? Agent1Icon : Agent2Icon;
    const alignment = isUser ? 'justify-end' : 'justify-start';
    const bgColor = isUser ? 'bg-indigo-600' : 'bg-gray-700';
    const order = isUser ? 'order-2' : 'order-1';

    return (
        <div className={`flex items-end gap-3 ${alignment}`}>
            {!isUser && (
                <div className={`w-10 h-10 rounded-full flex-shrink-0 ${isAgent1 ? 'bg-sky-500' : 'bg-green-500'} flex items-center justify-center order-1`}>
                    <Icon />
                </div>
            )}
            <div className={`p-4 rounded-2xl max-w-md md:max-w-lg ${bgColor} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'} ${order}`}>
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
            </div>
             {isUser && (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center order-2">
                   <UserIcon />
                </div>
            )}
        </div>
    );
};

export default Message;
