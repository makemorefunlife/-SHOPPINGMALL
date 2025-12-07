/**
 * @file CartItemCard.tsx
 * @description 장바구니 아이템 카드 컴포넌트
 * 
 * 장바구니 페이지에서 사용할 아이템 카드 컴포넌트
 */

'use client';

import { useState } from 'react';
import { updateCartItemQuantity, removeFromCart } from '@/actions/cart';
import type { CartItemWithProduct } from '@/lib/supabase/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartItemCardProps {
  item: CartItemWithProduct;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const formattedPrice = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(item.product.price * item.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock_quantity) {
      return;
    }

    setQuantity(newQuantity);
    setIsUpdating(true);

    const result = await updateCartItemQuantity(item.id, newQuantity);
    
    if (result.error) {
      alert(result.error);
      setQuantity(item.quantity); // 원래 값으로 복구
    }

    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    setIsRemoving(true);
    const result = await removeFromCart(item.id);
    
    if (result.error) {
      alert(result.error);
    }

    setIsRemoving(false);
  };

  return (
    <div className="border rounded-lg p-4 flex gap-4">
      {/* 상품 이미지 */}
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
        <div className="text-gray-400 text-xs">이미지</div>
      </div>

      {/* 상품 정보 */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
          }).format(item.product.price)} / 개
        </p>
        
        {/* 수량 조절 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isUpdating || quantity <= 1}
          >
            -
          </Button>
          <Input
            type="number"
            min="1"
            max={item.product.stock_quantity}
            value={quantity}
            onChange={(e) => {
              const newQty = parseInt(e.target.value) || 1;
              setQuantity(newQty);
            }}
            onBlur={() => handleQuantityChange(quantity)}
            className="w-20 text-center"
            disabled={isUpdating}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating || quantity >= item.product.stock_quantity}
          >
            +
          </Button>
          <span className="text-sm text-gray-500 ml-2">
            (재고: {item.product.stock_quantity}개)
          </span>
        </div>
      </div>

      {/* 가격 및 삭제 */}
      <div className="flex flex-col items-end justify-between">
        <div className="text-xl font-bold text-primary mb-2">
          {formattedPrice}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-red-600 hover:text-red-700"
        >
          {isRemoving ? '삭제 중...' : '삭제'}
        </Button>
      </div>
    </div>
  );
}

