/**
 * @file orders.ts
 * @description 주문 관련 Supabase 쿼리 함수
 * 
 * Server Component에서 사용할 수 있는 주문 데이터 조회 함수들
 */

import { createClerkSupabaseClient } from './server';
import type { Order, OrderItem, Product } from '@/types/database';

export interface OrderWithItems extends Order {
  order_items: Array<OrderItem & { product?: Product }>;
}

/**
 * 사용자의 주문 목록 조회
 */
export async function getOrders(): Promise<Order[]> {
  const supabase = createClerkSupabaseClient();
  const { userId } = await import('@clerk/nextjs/server').then(m => m.auth());

  if (!userId) {
    return [];
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('clerk_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return orders || [];
}

/**
 * 주문 ID로 단일 주문 조회 (주문 아이템 포함)
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = createClerkSupabaseClient();
  const { userId } = await import('@clerk/nextjs/server').then(m => m.auth());

  if (!userId) {
    return null;
  }

  // 주문 조회
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('clerk_id', userId)
    .single();

  if (orderError || !order) {
    return null;
  }

  // 주문 아이템 조회
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return {
      ...order,
      order_items: [],
    };
  }

  // 상품 정보 조회 (선택사항)
  const productIds = orderItems?.map(item => item.product_id) || [];
  let products: Product[] = [];
  
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    products = productsData || [];
  }

  // 주문 아이템과 상품 정보 결합
  const orderItemsWithProducts = (orderItems || []).map(item => ({
    ...item,
    product: products.find(p => p.id === item.product_id),
  }));

  return {
    ...order,
    order_items: orderItemsWithProducts,
  };
}

