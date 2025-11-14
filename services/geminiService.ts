
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";
import { Product, CartItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Agent 1, a friendly and helpful shopping assistant for an electronics store.
Your goal is to help users find products and manage their cart.

1.  Start by asking the user what they are looking for.
2.  When the user specifies a product or category (e.g., "laptop", "sony headphones"), you MUST use the 'searchBestBuy' function to find relevant items.
3.  The results of 'searchBestBuy' will be provided back to you. Present these results to the user as a numbered list. For example: "I found a few options: 1. MacBook Pro ($1999), 2. Dell XPS ($1599)".
4.  If no results are found, inform the user and ask them to be more specific or try a different search.
5.  When a user chooses an item from the list (e.g., "I want option 1", "add the Dell XPS to my cart"), you MUST use the 'addItemToCart' function. Identify the correct product from the search results context provided to you and call the function with the product's details and a quantity of 1. If a user asks to add multiple distinct items in one message (e.g., "add a macbook and airpods"), you should make multiple, parallel 'addItemToCart' function calls in the same turn.
6.  When a user asks to remove an item (e.g., "remove the MacBook"), you MUST use the 'removeItemFromCart' function. Use the product name as mentioned by the user to identify the item to be removed from the cart context.
7.  When the user indicates they are ready to checkout (e.g., "let's checkout", "I'm ready to pay"), you MUST use the 'startCheckout' function.
8.  The system will provide a single confirmation message after your requested cart updates are complete. You do not need to confirm the cart update yourself.
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

const addItemToCartFunctionDeclaration: FunctionDeclaration = {
    name: 'addItemToCart',
    parameters: {
        type: Type.OBJECT,
        description: 'Adds a specified quantity of a single product to the shopping cart.',
        properties: {
             id: { type: Type.STRING, description: 'The product ID.'},
             name: { type: Type.STRING, description: 'The product name.' },
             price: { type: Type.NUMBER, description: 'The product price.'},
             image: { type: Type.STRING, description: 'URL of the product image.'},
             quantity: { type: Type.NUMBER, description: 'The quantity of this product to add.'}
        },
        required: ['id', 'name', 'price', 'image', 'quantity']
    }
};

const removeItemFromCartFunctionDeclaration: FunctionDeclaration = {
    name: 'removeItemFromCart',
    parameters: {
        type: Type.OBJECT,
        description: 'Removes a product from the shopping cart based on its name.',
        properties: {
             productName: { type: Type.STRING, description: 'The name of the product to remove from the cart (e.g., "MacBook Pro 14").' }
        },
        required: ['productName']
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
            model: 'gemini-flash-lite-latest',
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [searchBestBuyFunctionDeclaration, addItemToCartFunctionDeclaration, removeItemFromCartFunctionDeclaration, startCheckoutFunctionDeclaration] }]
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
            searchContext = `IMPORTANT CONTEXT: You have just shown the user a list of products. Here is the full JSON data for those products: ${fullDataForAgent}. When the user picks an item (e.g., "add number 1" or "the MacBook"), you MUST use the corresponding object from this JSON data to get the id, name, price, and image for the 'addItemToCart' function call.`;
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
