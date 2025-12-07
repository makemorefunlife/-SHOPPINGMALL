/**
 * @file orders.ts
 * @description 주문 관련 Server Actions
 * 
 * 주문 생성 및 합계 검증 기능
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  postalCode: string;
}

interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  orderNote?: string;
}

/**
 * 주문 생성
 */
export async function createOrder(input: CreateOrderInput) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  // 장바구니 아이템 조회
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('product_id, quantity')
    .eq('clerk_id', userId);

  if (cartError || !cartItems || cartItems.length === 0) {
    return { error: '장바구니가 비어있습니다.' };
  }

  // 상품 정보 조회 및 재고 확인
  const productIds = cartItems.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity')
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError || !products) {
    return { error: '상품 정보를 불러올 수 없습니다.' };
  }

  // 재고 확인 및 주문 아이템 생성
  const orderItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }> = [];
  
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const product = products.find(p => p.id === cartItem.product_id);
    
    if (!product) {
      return { error: `상품을 찾을 수 없습니다. (ID: ${cartItem.product_id})` };
    }

    if (product.stock_quantity < cartItem.quantity) {
      return { error: `${product.name}의 재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)` };
    }

    const itemTotal = product.price * cartItem.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: cartItem.quantity,
      price: product.price,
    });
  }

  // 주문 생성 (트랜잭션 처리)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      clerk_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: input.shippingAddress,
      order_note: input.orderNote || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    return { error: '주문 생성에 실패했습니다.' };
  }

  // 주문 아이템 생성
  const orderItemsToInsert = orderItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert);

  if (orderItemsError) {
    console.error('Error creating order items:', orderItemsError);
    // 주문 삭제 (롤백)
    await supabase.from('orders').delete().eq('id', order.id);
    return { error: '주문 아이템 생성에 실패했습니다.' };
  }

  // 장바구니 비우기
  await supabase
    .from('cart_items')
    .delete()
    .eq('clerk_id', userId);

  revalidatePath('/cart');
  revalidatePath('/orders');
  
  return { success: true, orderId: order.id };
}

