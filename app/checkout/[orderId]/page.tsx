/**
 * @file page.tsx
 * @description 결제 페이지
 * 
 * Toss Payments 결제 위젯을 사용한 결제 처리
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { confirmPayment, handlePaymentFailure } from '@/actions/payments';
import { getOrderById } from '@/lib/supabase/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

// Toss Payments 위젯을 동적으로 로드하기 위한 타입 선언
declare global {
  interface Window {
    TossPayments: any;
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    async function loadOrder() {
      const resolvedParams = await params;
      const orderIdValue = resolvedParams.orderId;
      setOrderId(orderIdValue);
      
      try {
        // 주문 정보 조회
        const response = await fetch(`/api/orders/${orderIdValue}`);
        if (response.ok) {
          const orderData = await response.json();
          setAmount(orderData.total_amount);
        } else {
          alert('주문 정보를 불러올 수 없습니다.');
          router.push('/orders');
        }
      } catch (error) {
        console.error('Error loading order:', error);
        alert('주문 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [params, router]);

  useEffect(() => {
    if (!orderId || !isSignedIn) return;

    // Toss Payments 위젯 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment-widget';
    script.async = true;
    script.onload = () => {
      initializePaymentWidget();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [orderId, isSignedIn]);

  const initializePaymentWidget = () => {
    if (!window.TossPayments || !orderId) return;

    // 테스트 모드 클라이언트 키 사용
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_...';
    
    const widget = window.TossPayments.Widget(clientKey, {
      customerKey: `customer_${orderId}`, // 고객 키
    });

    widgetRef.current = widget;

    // 결제 위젯 렌더링
    widget.renderPaymentMethods('#payment-widget', {
      value: amount,
      currency: 'KRW',
    });

    setIsLoading(false);
  };

  const handlePayment = async () => {
    if (!widgetRef.current || !orderId) return;

    setIsProcessing(true);

    try {
      // 결제 요청
      await widgetRef.current.requestPayment({
        orderId: `order_${orderId}`,
        orderName: `주문 #${orderId.slice(0, 8)}`,
        successUrl: `${window.location.origin}/checkout/${orderId}/success`,
        failUrl: `${window.location.origin}/checkout/${orderId}/fail`,
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('결제 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Link href="/">
            <Button>홈으로 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">결제 위젯을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">결제하기</h1>

        <div className="border rounded-lg p-6 mb-6">
          <div id="payment-widget" className="mb-6"></div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>총 결제 금액</span>
              <span className="text-primary">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(amount)}
              </span>
            </div>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || amount === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? '결제 처리 중...' : '결제하기'}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>테스트 모드: 실제 결제가 발생하지 않습니다.</p>
        </div>
      </div>
    </div>
  );
}

