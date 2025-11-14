
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";
import { CartItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Agent 2, a friendly and secure payment specialist.
Your goal is to guide the user through the payment process.
1. Acknowledge the user's cart items and total price, which are provided in the initial context.
2. Ask the user for their Google email address to send a confirmation code.
3. When the user provides an email, you MUST call the 'sendCodeToEmail' function.
4. After the code is sent successfully, ask the user to enter the 6-digit code they received.
5. If sending the code fails (e.g., invalid email format), inform the user about the error and ask them to provide a valid email again.
6. When the user provides the code, you MUST call the 'verifyCodeAndPay' function.
7. If code verification fails, inform the user it was incorrect and ask them to try again.
8. Once payment is successful, provide a confirmation message and conclude the conversation.
9. Do not answer any questions unrelated to the payment process. Be polite but firm.
10. You cannot see the actual code value.
`;

const sendCodeToEmailFunctionDeclaration: FunctionDeclaration = {
    name: 'sendCodeToEmail',
    parameters: {
        type: Type.OBJECT,
        description: 'Sends a verification code to the user\'s Google email address.',
        properties: {
            email: {
                type: Type.STRING,
                description: 'The user\'s Google email address (e.g., user@gmail.com).',
            }
        },
        required: ['email']
    }
};

const verifyCodeAndPayFunctionDeclaration: FunctionDeclaration = {
    name: 'verifyCodeAndPay',
    parameters: {
        type: Type.OBJECT,
        description: 'Verifies the code and processes the payment.',
        properties: {
            code: {
                type: Type.STRING,
                description: 'The 6-digit code provided by the user.'
            }
        },
        required: ['code']
    }
};


export const getAgent2Chat = (cart: CartItem[]): { chat: Chat; initialMessage: string; } => {
    const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
    const productNames = cart.map(p => `${p.name} (x${p.quantity})`).join(', ');
    const initialMessage = `Hello! I'm Agent 2, your payment specialist. I see you'd like to purchase: ${productNames} for a total of $${total}. To proceed, please provide your Google email address so I can send a verification code.`;

    const chat = ai.chats.create({
        // FIX: Use 'gemini-flash-lite-latest' as per coding guidelines.
        model: 'gemini-flash-lite-latest',
        config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [sendCodeToEmailFunctionDeclaration, verifyCodeAndPayFunctionDeclaration] }]
        },
        history: [
            {
                role: 'user',
                parts: [{ text: `The user is ready to check out. Cart: [${productNames}]. Total: $${total}.` }]
            },
            {
                role: 'model',
                parts: [{ text: initialMessage }]
            }
        ]
    });
    return { chat, initialMessage };
};

export const sendMessageToAgent2 = async (message: string | Part[], chatSession: Chat) => {
    const result = await chatSession.sendMessage({ message });
    return result;
};
