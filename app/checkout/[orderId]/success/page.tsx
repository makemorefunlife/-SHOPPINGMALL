/**
 * @file page.tsx
 * @description 결제 성공 페이지
 * 
 * Toss Payments 결제 성공 후 콜백 처리
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPayment } from '@/actions/payments';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PaymentSuccessPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processPayment() {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);

      // URL에서 결제 정보 가져오기
      const paymentKey = searchParams.get('paymentKey');
      const amount = searchParams.get('amount');

      if (!paymentKey || !amount) {
        setError('결제 정보가 없습니다.');
        setIsProcessing(false);
        return;
      }

      // 결제 승인 처리
      const result = await confirmPayment(
        resolvedParams.orderId,
        paymentKey,
        parseInt(amount)
      );

      setIsProcessing(false);

      if (result.error) {
        setError(result.error);
      }
    }

    processPayment();
  }, [params, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h1 className="text-3xl font-bold mb-4">결제 처리 실패</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline">주문 내역으로</Button>
            </Link>
            <Link href="/">
              <Button>홈으로 가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다</h1>
        <p className="text-gray-600 mb-8">
          주문이 성공적으로 처리되었습니다.
          {orderId && (
            <span className="block mt-2 text-sm">
              주문번호: {orderId.slice(0, 8)}...
            </span>
          )}
        </p>
        <div className="flex gap-4 justify-center">
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <Button>주문 상세보기</Button>
            </Link>
          )}
          <Link href="/orders">
            <Button variant="outline">주문 내역으로</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

