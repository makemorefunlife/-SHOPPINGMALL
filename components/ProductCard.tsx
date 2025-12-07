/**
 * @file ProductCard.tsx
 * @description 상품 카드 컴포넌트
 * 
 * 상품 목록에서 사용할 카드 형태의 상품 표시 컴포넌트
 */

import Link from 'next/link';
import type { Product } from '@/types/database';
import { CATEGORY_NAMES } from '@/types/database';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(product.price);

  const categoryName = product.category ? CATEGORY_NAMES[product.category] || product.category : '기타';

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* 상품 이미지 영역 (플레이스홀더) */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">이미지 준비중</div>
        </div>

        {/* 상품 정보 */}
        <div className="p-4 flex flex-col flex-1">
          <div className="text-xs text-gray-500 mb-1">{categoryName}</div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
              {product.description}
            </p>
          )}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-primary">{formattedPrice}</span>
              <span className="text-sm text-gray-500">
                재고: {product.stock_quantity}개
              </span>
            </div>
            <Button className="w-full" variant="outline">
              상세보기
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

