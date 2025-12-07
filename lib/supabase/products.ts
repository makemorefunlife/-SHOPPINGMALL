/**
 * @file products.ts
 * @description 상품 관련 Supabase 쿼리 함수
 * 
 * Server Component에서 사용할 수 있는 상품 데이터 조회 함수들
 */

import { createClerkSupabaseClient } from './server';
import { createClient } from '@supabase/supabase-js';
import type { Product, ProductCategory } from '@/types/database';

/**
 * 공개 데이터용 Supabase 클라이언트 생성
 * 인증이 필요 없는 공개 데이터 조회용
 */
function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 활성화된 모든 상품 조회
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

/**
 * 카테고리별 상품 조회
 */
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
}

/**
 * 상품 ID로 단일 상품 조회
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * 인기 상품 조회 (최근 생성된 상위 N개)
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const supabase = createPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      // 에러를 throw하지 않고 빈 배열 반환 (페이지가 깨지지 않도록)
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in getFeaturedProducts:', err);
    return [];
  }
}

/**
 * 모든 카테고리 목록 조회
 */
export async function getCategories(): Promise<string[]> {
  try {
    const supabase = createPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    // 중복 제거
    const uniqueCategories = Array.from(
      new Set(data?.map(item => item.category).filter(Boolean))
    ) as string[];

    return uniqueCategories;
  } catch (err) {
    console.error('Unexpected error in getCategories:', err);
    return [];
  }
}

