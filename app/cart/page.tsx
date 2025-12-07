/**
 * @file page.tsx
 * @description 장바구니 페이지
 * 
 * 장바구니 아이템 목록 및 총 금액 표시
 */

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { getCartItems, getCartTotal } from '@/lib/supabase/cart';
import { CartItemCard } from '@/components/CartItemCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CartPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">장바구니</h1>

        <SignedOut>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
            <SignInButton mode="modal">
              <Button>로그인하기</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <CartContent />
        </SignedIn>
      </div>
    </div>
  );
}

async function CartContent() {
  const cartItems = await getCartItems();
  const total = await getCartTotal();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">장바구니가 비어있습니다.</p>
        <Link href="/products">
          <Button>상품 보러가기</Button>
        </Link>
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 장바구니 아이템 목록 */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* 주문 요약 */}
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 sticky top-4">
          <h2 className="text-2xl font-bold mb-4">주문 요약</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>상품 수</span>
              <span>{cartItems.length}개</span>
            </div>
            <div className="flex justify-between">
              <span>총 수량</span>
              <span>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}개
              </span>
            </div>
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>총 금액</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="block">
            <Button className="w-full" size="lg">
              주문하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

