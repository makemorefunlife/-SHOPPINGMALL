/**
 * @file page.tsx
 * @description 마이페이지
 * 
 * 사용자 정보 및 주문 내역을 한눈에 볼 수 있는 페이지
 */

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { getOrders } from '@/lib/supabase/orders';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

const STATUS_NAMES: Record<string, string> = {
  pending: '주문 대기',
  confirmed: '주문 확인',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
};

export default async function MyPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <SignedOut>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
            <SignInButton mode="modal">
              <Button>로그인하기</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <MyPageContent />
        </SignedIn>
      </div>
    </div>
  );
}

async function MyPageContent() {
  const orders = await getOrders();
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">마이페이지</h1>
        <UserButton />
      </div>

      {/* 주문 내역 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">전체 주문</h2>
          <p className="text-3xl font-bold text-primary">{orders.length}건</p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">배송 중</h2>
          <p className="text-3xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'shipped').length}건
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">배송 완료</h2>
          <p className="text-3xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}건
          </p>
        </div>
      </div>

      {/* 최근 주문 내역 */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">최근 주문 내역</h2>
          <Link href="/orders">
            <Button variant="outline">전체 보기</Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">주문 내역이 없습니다.</p>
            <Link href="/products">
              <Button>상품 보러가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const formattedTotal = new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(order.total_amount);

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
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
                      <div className="text-xl font-bold text-primary mb-1">
                        {formattedTotal}
                      </div>
                      <div className="text-sm text-gray-500">상세보기 →</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/products">
          <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🛍️</div>
            <div className="font-semibold">상품 보기</div>
          </div>
        </Link>
        <Link href="/cart">
          <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-semibold">장바구니</div>
          </div>
        </Link>
        <Link href="/orders">
          <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-semibold">주문 내역</div>
          </div>
        </Link>
        <Link href="/">
          <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-semibold">홈</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

