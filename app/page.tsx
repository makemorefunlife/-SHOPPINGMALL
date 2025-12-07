/**
 * @file page.tsx
 * @description 홈 페이지
 * 
 * 프로모션 배너와 카테고리 진입 동선을 제공하는 메인 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, getCategories } from "@/lib/supabase/products";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_NAMES } from "@/types/database";

export default async function Home() {
  // 인기 상품 8개 조회 (에러 발생 시 빈 배열 반환)
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  
  try {
    featuredProducts = await getFeaturedProducts(8);
    categories = await getCategories();
  } catch (error) {
    console.error('Error loading home page data:', error);
    // 에러가 발생해도 페이지는 표시되도록 빈 배열 사용
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 프로모션 배너 섹션 */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            최신 트렌드의 다양한 상품을 만나보세요
          </p>
          <Link href="/products">
            <Button size="lg" className="text-lg px-8 py-6">
              전체 상품 보기
            </Button>
          </Link>
        </div>
      </section>

      {/* 카테고리 진입 섹션 */}
      {categories.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">카테고리</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/products?category=${category}`}
                  className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow hover:border-primary"
                >
                  <div className="text-2xl mb-2">🛍️</div>
                  <div className="font-semibold">
                    {CATEGORY_NAMES[category] || category}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 인기 상품 섹션 */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">인기 상품</h2>
              <Link href="/products">
                <Button variant="outline">더보기 →</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
