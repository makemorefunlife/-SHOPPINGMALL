/**
 * @file page.tsx
 * @description 주문 목록 페이지
 * 
 * 사용자의 주문 내역 목록 조회
 */

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { getOrders } from '@/lib/supabase/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STATUS_NAMES: Record<string, string> = {
  pending: '주문 대기',
  confirmed: '주문 확인',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
};

export default async function OrdersPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">주문 내역</h1>

        <SignedOut>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
            <SignInButton mode="modal">
              <Button>로그인하기</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <OrdersList />
        </SignedIn>
      </div>
    </div>
  );
}

async function OrdersList() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">주문 내역이 없습니다.</p>
        <Link href="/products">
          <Button>상품 보러가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const formattedTotal = new Intl.NumberFormat('ko-KR', {
          style: 'currency',
          currency: 'KRW',
        }).format(order.total_amount);

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-mono text-sm text-gray-500">
                    {order.id.slice(0, 8)}...
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {STATUS_NAMES[order.status] || order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-1">
                  {formattedTotal}
                </div>
                <div className="text-sm text-gray-500">상세보기 →</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

