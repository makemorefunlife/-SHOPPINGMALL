/**
 * @file page.tsx
 * @description 상품 상세 페이지
 * 
 * 상품의 재고, 가격, 설명을 표시하는 상세 페이지
 */

import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/supabase/products';
import { CATEGORY_NAMES } from '@/types/database';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/AddToCartButton';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(product.price);

  const categoryName = product.category 
    ? CATEGORY_NAMES[product.category] || product.category 
    : '기타';

  const isInStock = product.stock_quantity > 0;

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/products">
          <Button variant="ghost" className="mb-4">
            ← 상품 목록으로
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 상품 이미지 영역 */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-lg">이미지 준비중</div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">{categoryName}</div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            </div>

            {/* 가격 */}
            <div className="border-t pt-4">
              <div className="text-3xl font-bold text-primary mb-2">
                {formattedPrice}
              </div>
            </div>

            {/* 재고 상태 */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold">재고 상태:</span>
                {isInStock ? (
                  <span className="text-green-600 font-semibold">
                    재고 있음 ({product.stock_quantity}개)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">품절</span>
                )}
              </div>
            </div>

            {/* 상품 설명 */}
            {product.description && (
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-3">상품 설명</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* 상품 정보 */}
            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>상품 ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span>등록일:</span>
                <span>{new Date(product.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="border-t pt-6 space-y-3">
              {isInStock ? (
                <>
                  <AddToCartButton productId={product.id} />
                  <Button className="w-full" variant="outline" size="lg">
                    바로 구매하기
                  </Button>
                </>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  품절된 상품입니다
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

