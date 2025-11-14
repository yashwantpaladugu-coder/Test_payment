
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";
import { Product, CartItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Agent 1, a friendly and helpful shopping assistant for an electronics store.
Your goal is to help users find products and manage their cart. You will be provided with the current cart contents and any recent search results in the prompt.

1.  Start by asking the user what they are looking for.
2.  When the user specifies a product or category (e.g., "laptop", "sony headphones"), you MUST use the 'searchBestBuy' function.
3.  The results of 'searchBestBuy' will be provided back to you. Present these results to the user as a numbered list.
4.  To add, update, or remove items from the cart, you MUST use the 'updateCartItem' function.
    - Based on the user's request and the current cart, you must calculate the NEW TOTAL QUANTITY for an item.
    - Example 1: Cart is empty. User says "add option 1". You call 'updateCartItem' for that product with quantity: 1.
    - Example 2: Cart has "Headphones (x1)". User says "add another one". You call 'updateCartItem' for headphones with quantity: 2.
    - Example 3: Cart has "Headphones (x2)". User says "remove one". You call 'updateCartItem' for headphones with quantity: 1.
    - Example 4: Cart has "Headphones (x1)". User says "remove it". You call 'updateCartItem' for headphones with quantity: 0.
5.  You MUST use the product details (id, name, price, image) from the search results context or cart context when calling 'updateCartItem'.
6.  If a user asks to perform multiple cart actions in one message (e.g., "add a macbook and remove the airpods"), you should make multiple, parallel 'updateCartItem' function calls in the same turn.
7.  When the user indicates they are ready to checkout (e.g., "let's checkout", "I'm ready to pay"), you MUST use the 'startCheckout' function.
8.  The system will provide a single confirmation message after your requested cart updates. You do not need to confirm the cart update yourself.
9.  Do not answer questions unrelated to shopping. Gently guide the user back to the task.
`;

const searchBestBuyFunctionDeclaration: FunctionDeclaration = {
    name: 'searchBestBuy',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches BestBuy for products based on a user\'s query.',
        properties: {
            query: {
                type: Type.STRING,
                description: 'The product or category to search for (e.g., "laptop", "iPhone").',
            }
        },
        required: ['query']
    }
};

const updateCartItemFunctionDeclaration: FunctionDeclaration = {
    name: 'updateCartItem',
    parameters: {
        type: Type.OBJECT,
        description: 'Adds, updates, or removes an item from the cart by setting its new quantity. To remove an item, set its quantity to 0.',
        properties: {
             id: { type: Type.STRING, description: 'The product ID.'},
             name: { type: Type.STRING, description: 'The product name.' },
             price: { type: Type.NUMBER, description: 'The product price.'},
             image: { type: Type.STRING, description: 'URL of the product image.'},
             quantity: { type: Type.NUMBER, description: 'The new total quantity for the item. Setting it to 0 will remove the item from the cart.'}
        },
        required: ['id', 'name', 'price', 'image', 'quantity']
    }
};


const startCheckoutFunctionDeclaration: FunctionDeclaration = {
    name: 'startCheckout',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        description: 'Initiates the checkout process by handing over to the payment agent.'
    }
};

let chat: Chat | null = null;

export const getAgent1Chat = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            // FIX: Use 'gemini-flash-lite-latest' as per coding guidelines.
            model: 'gemini-2.5-flash-lite',
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [searchBestBuyFunctionDeclaration, updateCartItemFunctionDeclaration, startCheckoutFunctionDeclaration] }]
            },
        });
    }
    return chat;
};

export const sendMessageToAgent1 = async (message: string | Part[], currentCart: CartItem[], searchResults: Product[]) => {
    // FIX: Corrected typo in function call from 'getAgent1-Chat' to 'getAgent1Chat'.
    const chatSession = getAgent1Chat();

    if (typeof message === 'string') {
        let searchContext = '';
        if (searchResults.length > 0) {
            const fullDataForAgent = JSON.stringify(searchResults);
            
            // This context is crucial. It gives the agent the full product data to use for function calls,
            // while also reminding it of the simple list it showed the user.
            searchContext = `IMPORTANT CONTEXT: You have just shown the user a list of products. Here is the full JSON data for those products: ${fullDataForAgent}. When the user picks an item (e.g., "add number 1" or "the MacBook"), you MUST use the corresponding object from this JSON data to get the id, name, price, and image for the 'updateCartItem' function call.`;
        }
        
        const prompt = `${searchContext}\n\nCurrent cart is: ${JSON.stringify(currentCart)}. User says: "${message}"`;
        
        const result = await chatSession.sendMessage({ message: prompt });
        return result;
    } else {
        // It's a function response (Part[])
        const result = await chatSession.sendMessage({ message });
        return result;
    }
};