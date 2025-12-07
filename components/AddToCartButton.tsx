/**
 * @file AddToCartButton.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/actions/cart';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';

interface AddToCartButtonProps {
  productId: string;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    const result = await addToCart(productId, 1);
    setIsAdding(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    if (result.success) {
      if (confirm('장바구니에 추가되었습니다. 장바구니로 이동하시겠습니까?')) {
        router.push('/cart');
      }
    }
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="w-full" size="lg">
          로그인 후 장바구니에 담기
        </Button>
      </SignInButton>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? '추가 중...' : '장바구니에 담기'}
    </Button>
  );
}

