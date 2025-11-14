
import React, { useState, useCallback, useEffect } from 'react';
import { Message, Role, Product, Cart, Agent, PaymentStep, CartItem, Transaction } from '../types';
import { INITIAL_MESSAGES } from '../constants';
import { sendMessageToAgent1 } from '../services/geminiService';
import { getAgent2Chat, sendMessageToAgent2 } from '../services/paymentService';
import { searchProducts } from '../services/bestbuyService';
import { loadTransactions, saveTransaction } from '../services/transactionService';
import { loadCart, saveCart } from '../services/cartService';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import MockEmail from './MockEmail';
import CartSidebar from './CartSidebar';
import PurchaseHistoryModal from './PurchaseHistoryModal';
import { GenerateContentResponse, Chat, Part } from '@google/genai';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface ShoppingPageProps {
    user: User;
}

const ShoppingPage: React.FC<ShoppingPageProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [cart, setCart] = useState<Cart>({ products: [] });
    const [currentAgent, setCurrentAgent] = useState<Agent>(Agent.AGENT_1);
    const [paymentStep, setPaymentStep] = useState<PaymentStep>(PaymentStep.IDLE);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [inputError, setInputError] = useState<string>('');
    const [agent2Chat, setAgent2Chat] = useState<Chat | null>(null);
    const [code, setCode] = useState<string>('');
    const [mockEmail, setMockEmail] = useState<{ to: string, code: string } | null>(null);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    useEffect(() => {
        // Load user-specific data on login
        setTransactions(loadTransactions(user.uid));
        setCart(loadCart(user.uid));
    }, [user.uid]);

    useEffect(() => {
        // Persist cart changes to localStorage
        saveCart(user.uid, cart);
    }, [cart, user.uid]);

    const addMessage = (role: Role, content: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, content }]);
    };
    
    const resetApp = () => {
        setMessages(INITIAL_MESSAGES);
        setCart({ products: [] });
        setCurrentAgent(Agent.AGENT_1);
        setPaymentStep(PaymentStep.IDLE);
        setIsLoading(false);
        setInputError('');
        setAgent2Chat(null);
        setCode('');
        setMockEmail(null);
        setSearchResults([]);
    };

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            const newProducts = [...prevCart.products];
            const productIndex = newProducts.findIndex(p => p.id === productId);

            if (productIndex > -1) {
                if (newQuantity > 0) {
                    newProducts[productIndex].quantity = newQuantity;
                } else {
                    newProducts.splice(productIndex, 1);
                }
            }
            return { products: newProducts };
        });
    };

    const handleCheckout = useCallback(() => {
        setIsLoading(true);
        addMessage(Role.SYSTEM, 'Transferring to payment agent...');

        const { chat, initialMessage } = getAgent2Chat(cart.products);
        setAgent2Chat(chat);
        
        if(initialMessage) {
             addMessage(Role.AGENT_2, initialMessage);
        }
        setCurrentAgent(Agent.AGENT_2);
        setPaymentStep(PaymentStep.CONFIRM_EMAIL);
        setIsLoading(false);

    }, [cart.products]);

    const handleCancelPayment = () => {
        setCurrentAgent(Agent.AGENT_1);
        setPaymentStep(PaymentStep.IDLE);
        setAgent2Chat(null);
        addMessage(Role.SYSTEM, "Payment cancelled. You can continue shopping.");
    };

    const processAgent1FunctionCall = useCallback(async (response: GenerateContentResponse) => {
        if (!response.functionCalls || response.functionCalls.length === 0) {
            if (response.text) {
                addMessage(Role.AGENT_1, response.text);
            }
            return;
        }
    
        const hasSearchCall = response.functionCalls.some(fc => fc.name === 'searchBestBuy');
        if (hasSearchCall) {
            const searchCall = response.functionCalls.find(fc => fc.name === 'searchBestBuy')!;
            const query = searchCall.args.query as string;
            addMessage(Role.SYSTEM, `Searching for "${query}"...`);
            const products = searchProducts(query);
            setSearchResults(products);
    
            const functionResponsePart: Part = {
                functionResponse: {
                    name: 'searchBestBuy',
                    response: { products: products.map(({ id, name, price }) => ({ id, name, price })) }
                }
            };
            
            const nextResponse = await sendMessageToAgent1([functionResponsePart], cart.products, products);
            await processAgent1FunctionCall(nextResponse);
            return;
        }
    
        if (response.functionCalls.some(fc => fc.name === 'startCheckout')) {
            handleCheckout();
            setSearchResults([]);
            return;
        }
    
        const cartUpdateCalls = response.functionCalls.filter(fc => fc.name === 'updateCartItem');
        if (cartUpdateCalls.length > 0) {
            const newCartProducts = [...cart.products];
            const confirmationParts: string[] = [];
            const addedConfirmations: string[] = [];
            const removedConfirmations: string[] = [];
            const updatedConfirmations: string[] = [];

            for (const fc of cartUpdateCalls) {
                const itemToUpdate = fc.args as unknown as CartItem;
                const existingItemIndex = newCartProducts.findIndex(p => p.id === itemToUpdate.id);
                const newQuantity = itemToUpdate.quantity;

                if (existingItemIndex > -1) {
                    if (newQuantity > 0) {
                        newCartProducts[existingItemIndex].quantity = newQuantity;
                        updatedConfirmations.push(`updated ${itemToUpdate.name} quantity to ${newQuantity}`);
                    } else {
                        newCartProducts.splice(existingItemIndex, 1);
                        removedConfirmations.push(itemToUpdate.name);
                    }
                } else if (newQuantity > 0) {
                    newCartProducts.push({ ...itemToUpdate, quantity: newQuantity });
                    addedConfirmations.push(`${itemToUpdate.name} (x${newQuantity})`);
                }
            }

            if (addedConfirmations.length > 0) confirmationParts.push(`added ${addedConfirmations.join(', ')}`);
            if (updatedConfirmations.length > 0) confirmationParts.push(...updatedConfirmations);
            if (removedConfirmations.length > 0) confirmationParts.push(`removed ${removedConfirmations.join(', ')}`);
            
            setCart({ products: newCartProducts });
    
            if (confirmationParts.length > 0) {
                const confirmationMessage = `I've updated your cart. I've ${confirmationParts.join(' and ')}.`;
                addMessage(Role.AGENT_1, confirmationMessage);
            }
            setSearchResults([]);
        }
    
    }, [handleCheckout, cart.products]);

    const handleAgent1Submit = useCallback(async (input: string) => {
        setIsLoading(true);
        addMessage(Role.USER, input);
        try {
            const response = await sendMessageToAgent1(input, cart.products, searchResults);
            await processAgent1FunctionCall(response);
        } catch (error) {
            console.error("Error sending message to Agent 1:", error);
            let errorMessage = "Sorry, an unexpected error occurred. Please try again later.";
            if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
                errorMessage = "API Rate Limit Exceeded: You've made too many requests. Please wait a moment and try again.";
            }
            addMessage(Role.SYSTEM, errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [cart.products, searchResults, processAgent1FunctionCall]);

    const handleAgent2Submit = useCallback(async (input: string) => {
        if (!agent2Chat) return;
        setInputError('');
        addMessage(Role.USER, input);
        setMockEmail(null);
        setIsLoading(true);

        try {
            let response = await sendMessageToAgent2(input, agent2Chat);

            while (response.functionCalls) {
                const fc = response.functionCalls[0];
                let functionResponsePayload;

                if (fc.name === 'sendCodeToEmail') {
                    const userEmail = fc.args.email as string;
                    addMessage(Role.SYSTEM, `Simulating sending code to ${userEmail}...`);
                    
                    if (userEmail && userEmail.toLowerCase().includes('@')) {
                        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setCode(generatedCode);
                        setMockEmail({ to: userEmail, code: generatedCode });
                        
                        setPaymentStep(PaymentStep.ENTER_CODE);
                        functionResponsePayload = { success: true, message: `A verification code has been sent to ${userEmail}. Please check your inbox.` };
                    } else {
                        functionResponsePayload = { success: false, error: "Invalid email address provided. Please provide a valid email address." };
                    }
                } else if (fc.name === 'verifyCodeAndPay') {
                    const userCode = fc.args.code as string;
                    if (userCode === code) {
                        setPaymentStep(PaymentStep.PROCESSING);
                        addMessage(Role.SYSTEM, 'Code correct. Processing payment...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        const updatedTransactions = saveTransaction(user.uid, cart.products);
                        setTransactions(updatedTransactions);
                        
                        setPaymentStep(PaymentStep.COMPLETED);
                        setCart({ products: [] }); 
                        functionResponsePayload = { success: true };
                    } else {
                        setInputError('Incorrect code. Please try again.');
                        functionResponsePayload = { success: false, error: 'Invalid code' };
                    }
                } else {
                    functionResponsePayload = { success: false, error: `Unknown function call: ${fc.name}` };
                }
                
                const functionResponsePart: Part = {
                    functionResponse: { name: fc.name, response: functionResponsePayload }
                };
                response = await sendMessageToAgent2([functionResponsePart], agent2Chat);
            }
            
            addMessage(Role.AGENT_2, response.text);

        } catch (error) {
            console.error("Error with Agent 2:", error);
            let errorMessage = "Sorry, there was an error with the payment service. Please try again.";
            if (error instanceof Error && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429'))) {
                 errorMessage = "API Rate Limit Exceeded during payment. Please wait a moment before trying again.";
            }
            addMessage(Role.SYSTEM, errorMessage);
            if (paymentStep === PaymentStep.PROCESSING) {
                setPaymentStep(PaymentStep.ENTER_CODE);
            }
        } finally {
            setIsLoading(false);
        }
    }, [agent2Chat, code, paymentStep, cart.products, user.uid]);

    const handleSubmit = (input: string) => {
        if (isLoading) return;

        if (paymentStep === PaymentStep.COMPLETED) {
            if (input.toLowerCase() === 'next') {
                resetApp();
            }

            return;
        }

        setMockEmail(null);
        if (currentAgent === Agent.AGENT_1) {
            handleAgent1Submit(input);
        } else {
            handleAgent2Submit(input);
        }
    };

    const getInputPlaceholder = () => {
        switch (paymentStep) {
            case PaymentStep.CONFIRM_EMAIL:
                return 'Enter your email address...';
            case PaymentStep.ENTER_CODE:
                return 'Enter your 6-digit code...';
            case PaymentStep.COMPLETED:
                return "Type 'next' to start a new order.";
            case PaymentStep.PROCESSING:
                return 'Payment in progress...';
            default:
                return 'What are you looking for today?';
        }
    };
    
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const isCheckoutActive = currentAgent === Agent.AGENT_2 && paymentStep !== PaymentStep.COMPLETED;

    return (
        <div className="bg-gray-900 text-white flex flex-col h-screen font-sans">
            {mockEmail && <MockEmail email={mockEmail} onClose={() => setMockEmail(null)} />}
            {isHistoryModalOpen && (
                <PurchaseHistoryModal 
                    transactions={transactions} 
                    onClose={() => setIsHistoryModalOpen(false)}
                    userId={user.uid}
                />
            )}
            <header className="bg-gray-800 p-4 shadow-md z-10">
                 <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="text-left">
                         <h1 className="text-xl font-bold text-indigo-400">Agentic Checkout</h1>
                         <p className="text-xs text-gray-400 mt-1">
                            Current Agent: <span className="font-semibold text-white">{currentAgent === Agent.AGENT_1 ? 'Shopping Assistant' : 'Payment Specialist'}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-300">
                            Welcome, <span className="font-semibold text-white">{user.displayName || user.email}</span>
                        </p>
                        <button onClick={handleSignOut} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex flex-1 min-h-0">
                <div className="flex-1 flex flex-col">
                    <ChatWindow messages={messages} isLoading={isLoading} />
                    <ChatInput
                        onSubmit={handleSubmit}
                        disabled={isLoading || paymentStep === PaymentStep.PROCESSING}
                        placeholder={getInputPlaceholder()}
                        error={inputError}
                    />
                </div>
                <aside className="w-1/3 max-w-sm flex-shrink-0">
                    <CartSidebar 
                        cart={cart} 
                        onCheckout={handleCheckout} 
                        isCheckoutActive={isCheckoutActive}
                        onCancelPayment={handleCancelPayment}
                        onQuantityChange={handleQuantityChange}
                        onViewHistory={() => setIsHistoryModalOpen(true)}
                    />
                </aside>
            </main>
        </div>
    );
};

export default ShoppingPage;