/**
 * @file page.tsx
 * @description 주문 상세 페이지
 * 
 * 주문 정보 및 주문 아이템 상세 표시
 */

import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/supabase/orders';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_NAMES: Record<string, string> = {
  pending: '주문 대기',
  confirmed: '주문 확인',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const formattedTotal = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(order.total_amount);

  const shippingAddress = order.shipping_address as {
    name?: string;
    phone?: string;
    address?: string;
    addressDetail?: string;
    postalCode?: string;
  } | null;

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/orders">
          <Button variant="ghost" className="mb-4">
            ← 주문 목록으로
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">주문 상세</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="md:col-span-2 space-y-6">
            {/* 주문 상태 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">주문 정보</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 번호</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 상태</span>
                  <span className="font-semibold">
                    {STATUS_NAMES[order.status] || order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 일시</span>
                  <span>
                    {new Date(order.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                {order.order_note && (
                  <div className="pt-2 border-t">
                    <div className="text-gray-600 mb-1">주문 메모</div>
                    <div className="text-sm">{order.order_note}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 배송지 정보 */}
            {shippingAddress && (
              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">배송지 정보</h2>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">받는 분:</span>{' '}
                    <span className="font-semibold">{shippingAddress.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">전화번호:</span>{' '}
                    {shippingAddress.phone}
                  </div>
                  <div>
                    <span className="text-gray-600">주소:</span>{' '}
                    ({shippingAddress.postalCode}) {shippingAddress.address}
                    {shippingAddress.addressDetail && ` ${shippingAddress.addressDetail}`}
                  </div>
                </div>
              </div>
            )}

            {/* 주문 아이템 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">주문 상품</h2>
              <div className="space-y-4">
                {order.order_items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const formattedPrice = new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                  }).format(item.price);
                  const formattedTotal = new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                  }).format(itemTotal);

                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <div className="text-gray-400 text-xs">이미지</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.product_name}</h3>
                        <div className="text-sm text-gray-600">
                          {formattedPrice} × {item.quantity}개
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formattedTotal}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="md:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4">주문 요약</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>상품 수</span>
                  <span>{order.order_items.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span>총 수량</span>
                  <span>
                    {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}개
                  </span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>총 금액</span>
                    <span className="text-primary">{formattedTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

