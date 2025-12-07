/**
 * @file cart.ts
 * @description 장바구니 관련 Server Actions
 * 
 * 장바구니 추가, 삭제, 수량 변경 기능
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 장바구니에 상품 추가
 */
export async function addToCart(productId: string, quantity: number = 1) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  if (quantity <= 0) {
    return { error: '수량은 1개 이상이어야 합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  // 상품 재고 확인
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock_quantity, name')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    return { error: '상품을 찾을 수 없습니다.' };
  }

  if (product.stock_quantity < quantity) {
    return { error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)` };
  }

  // 기존 장바구니 아이템 확인
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('clerk_id', userId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // 기존 아이템이 있으면 수량 업데이트
    const newQuantity = existingItem.quantity + quantity;
    
    if (product.stock_quantity < newQuantity) {
      return { error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)` };
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.id);

    if (error) {
      console.error('Error updating cart item:', error);
      return { error: '장바구니 업데이트에 실패했습니다.' };
    }
  } else {
    // 새 아이템 추가
    const { error } = await supabase
      .from('cart_items')
      .insert({
        clerk_id: userId,
        product_id: productId,
        quantity,
      });

    if (error) {
      console.error('Error adding to cart:', error);
      return { error: '장바구니 추가에 실패했습니다.' };
    }
  }

  revalidatePath('/cart');
  revalidatePath('/products');
  return { success: true };
}

/**
 * 장바구니 아이템 수량 변경
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  if (quantity <= 0) {
    return { error: '수량은 1개 이상이어야 합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  // 장바구니 아이템과 상품 정보 조회
  const { data: cartItem, error: cartError } = await supabase
    .from('cart_items')
    .select('product_id')
    .eq('id', cartItemId)
    .eq('clerk_id', userId)
    .single();

  if (cartError || !cartItem) {
    return { error: '장바구니 아이템을 찾을 수 없습니다.' };
  }

  // 상품 재고 확인
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', cartItem.product_id)
    .single();

  if (productError || !product) {
    return { error: '상품을 찾을 수 없습니다.' };
  }

  if (product.stock_quantity < quantity) {
    return { error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)` };
  }

  // 수량 업데이트
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('clerk_id', userId);

  if (error) {
    console.error('Error updating cart item quantity:', error);
    return { error: '수량 변경에 실패했습니다.' };
  }

  revalidatePath('/cart');
  return { success: true };
}

/**
 * 장바구니 아이템 삭제
 */
export async function removeFromCart(cartItemId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('clerk_id', userId);

  if (error) {
    console.error('Error removing cart item:', error);
    return { error: '장바구니에서 삭제에 실패했습니다.' };
  }

  revalidatePath('/cart');
  return { success: true };
}

