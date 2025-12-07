/**
 * @file page.tsx
 * @description 결제 실패 페이지
 * 
 * Toss Payments 결제 실패 후 콜백 처리
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handlePaymentFailure } from '@/actions/payments';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PaymentFailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function PaymentFailPage({ params }: PaymentFailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  useEffect(() => {
    async function processFailure() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);

      // 결제 실패 처리
      await handlePaymentFailure(resolvedParams.orderId);
      setIsProcessing(false);
    }

    processFailure();
  }, [params]);

  if (isProcessing) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">처리 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">✕</div>
        <h1 className="text-3xl font-bold mb-4">결제가 실패했습니다</h1>
        {errorCode && (
          <p className="text-gray-600 mb-2">
            오류 코드: {errorCode}
          </p>
        )}
        {errorMessage && (
          <p className="text-gray-600 mb-8">
            {errorMessage}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <Button variant="outline">주문 상세보기</Button>
            </Link>
          )}
          <Link href="/cart">
            <Button>장바구니로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

