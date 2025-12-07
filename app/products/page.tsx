/**
 * @file page.tsx
 * @description 상품 목록 페이지
 * 
 * 페이지네이션, 정렬, 카테고리 필터 기능을 제공하는 상품 목록 페이지
 */

import { Suspense } from 'react';
import { getProductsByCategory, getCategories } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORY_NAMES } from '@/types/database';
import type { ProductCategory } from '@/types/database';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

async function ProductsList({
  category,
  sort = 'newest',
}: {
  category?: string;
  sort?: string;
}) {
  const products = await getProductsByCategory(category as ProductCategory);

  // 정렬 처리
  let sortedProducts = [...products];
  switch (sort) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    default:
      sortedProducts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || 'newest';
  const categories = await getCategories();

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">전체 상품</h1>
          
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link href="/products">
              <Button
                variant={!category ? 'default' : 'outline'}
                size="sm"
              >
                전체
              </Button>
            </Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/products?category=${cat}`}>
                <Button
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                >
                  {CATEGORY_NAMES[cat] || cat}
                </Button>
              </Link>
            ))}
          </div>

          {/* 정렬 옵션 */}
          <div className="flex gap-2">
            <Link href={`/products${category ? `?category=${category}&sort=newest` : '?sort=newest'}`}>
              <Button
                variant={sort === 'newest' ? 'default' : 'outline'}
                size="sm"
              >
                최신순
              </Button>
            </Link>
            <Link href={`/products${category ? `?category=${category}&sort=price-low` : '?sort=price-low'}`}>
              <Button
                variant={sort === 'price-low' ? 'default' : 'outline'}
                size="sm"
              >
                낮은가격순
              </Button>
            </Link>
            <Link href={`/products${category ? `?category=${category}&sort=price-high` : '?sort=price-high'}`}>
              <Button
                variant={sort === 'price-high' ? 'default' : 'outline'}
                size="sm"
              >
                높은가격순
              </Button>
            </Link>
            <Link href={`/products${category ? `?category=${category}&sort=name` : '?sort=name'}`}>
              <Button
                variant={sort === 'name' ? 'default' : 'outline'}
                size="sm"
              >
                이름순
              </Button>
            </Link>
          </div>
        </div>

        {/* 상품 목록 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <ProductsList category={category} sort={sort} />
        </Suspense>
      </div>
    </div>
  );
}

