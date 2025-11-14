
export enum Role {
  USER = 'user',
  AGENT_1 = 'agent1',
  AGENT_2 = 'agent2',
  SYSTEM = 'system',
}

export enum Agent {
  AGENT_1 = 'AGENT_1',
  AGENT_2 = 'AGENT_2',
}

export enum PaymentStep {
  IDLE,
  CONFIRM_EMAIL,
  ENTER_CODE,
  PROCESSING,
  COMPLETED,
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  products: CartItem[];
}

export interface Message {
  id: string;
  role: Role;
  content: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  products: CartItem[];
  total: number;
}
