/**
 * @file cart.ts
 * @description 장바구니 관련 Supabase 쿼리 함수
 * 
 * Server Component에서 사용할 수 있는 장바구니 데이터 조회 함수들
 */

import { createClerkSupabaseClient } from './server';
import type { CartItem, Product } from '@/types/database';

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * 사용자의 장바구니 아이템 조회 (상품 정보 포함)
 */
export async function getCartItems(): Promise<CartItemWithProduct[]> {
  const supabase = createClerkSupabaseClient();
  const { userId } = await import('@clerk/nextjs/server').then(m => m.auth());

  if (!userId) {
    return [];
  }

  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false });

  if (error || !cartItems || cartItems.length === 0) {
    return [];
  }

  // 상품 정보 조회
  const productIds = cartItems.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (productsError || !products) {
    return [];
  }

  // 장바구니 아이템과 상품 정보 결합
  return cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.product_id);
    return {
      ...cartItem,
      product: product!,
    };
  }).filter(item => item.product); // 상품이 없는 경우 제외
}

/**
 * 장바구니 총 금액 계산
 */
export async function getCartTotal(): Promise<number> {
  const cartItems = await getCartItems();
  return cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
}

