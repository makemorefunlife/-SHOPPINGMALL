/**
 * @file database.ts
 * @description 데이터베이스 타입 정의
 * 
 * Supabase products, cart_items, orders, order_items 테이블의 TypeScript 타입 정의
 */

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Record<string, any> | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

// 카테고리 타입
export type ProductCategory = 
  | 'electronics' 
  | 'clothing' 
  | 'books' 
  | 'food' 
  | 'sports' 
  | 'beauty' 
  | 'home'
  | null;

// 카테고리 한글명 매핑
export const CATEGORY_NAMES: Record<string, string> = {
  electronics: '전자제품',
  clothing: '의류',
  books: '도서',
  food: '식품',
  sports: '스포츠',
  beauty: '뷰티',
  home: '생활/가정',
};

