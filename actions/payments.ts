/**
 * @file payments.ts
 * @description 결제 관련 Server Actions
 * 
 * Toss Payments 결제 승인 처리 및 주문 상태 업데이트
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 결제 승인 처리 및 주문 상태 업데이트
 */
export async function confirmPayment(orderId: string, paymentKey: string, amount: number) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  // 주문 확인
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('clerk_id', userId)
    .single();

  if (orderError || !order) {
    return { error: '주문을 찾을 수 없습니다.' };
  }

  // 이미 결제 완료된 주문인지 확인
  if (order.status !== 'pending') {
    return { error: '이미 처리된 주문입니다.' };
  }

  // 금액 검증
  if (order.total_amount !== amount) {
    return { error: '결제 금액이 일치하지 않습니다.' };
  }

  // Toss Payments 승인 API 호출 (테스트 모드)
  // 실제 환경에서는 Toss Payments 서버 API를 호출해야 합니다
  // 여기서는 테스트 모드이므로 바로 승인 처리
  try {
    // 테스트 모드: 실제 API 호출 없이 승인 처리
    // 프로덕션에서는 아래와 같이 Toss Payments API를 호출해야 합니다:
    /*
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || '결제 승인에 실패했습니다.' };
    }
    */

    // 주문 상태 업데이트
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return { error: '주문 상태 업데이트에 실패했습니다.' };
    }

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');

    return { success: true, orderId };
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return { error: '결제 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 결제 실패 처리
 */
export async function handlePaymentFailure(orderId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  // 주문 확인
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('clerk_id', userId)
    .single();

  if (orderError || !order) {
    return { error: '주문을 찾을 수 없습니다.' };
  }

  // 주문 상태를 취소로 변경
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order status:', updateError);
    return { error: '주문 상태 업데이트에 실패했습니다.' };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');

  return { success: true };
}

