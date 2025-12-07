/**
 * @file page.tsx
 * @description 주문 페이지
 * 
 * 주소 및 메모 입력 후 주문 생성
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { createOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const orderSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  phone: z.string().min(1, '전화번호를 입력해주세요'),
  postalCode: z.string().min(1, '우편번호를 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().optional(),
  orderNote: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);

    const result = await createOrder({
      shippingAddress: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        postalCode: data.postalCode,
      },
      orderNote: data.orderNote,
    });

    setIsSubmitting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    if (result.success && result.orderId) {
      router.push(`/checkout/${result.orderId}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">주문하기</h1>

        <SignedOut>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
            <SignInButton mode="modal">
              <Button>로그인하기</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 배송지 정보 */}
            <div className="border rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold mb-4">배송지 정보</h2>

              <div>
                <Label htmlFor="name">받는 분 이름 *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="홍길동"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="010-1234-5678"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">우편번호 *</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  placeholder="12345"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">주소 *</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="서울시 강남구 테헤란로 123"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="addressDetail">상세주소</Label>
                <Input
                  id="addressDetail"
                  {...register('addressDetail')}
                  placeholder="101호"
                />
              </div>
            </div>

            {/* 주문 메모 */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">주문 메모</h2>
              <Textarea
                {...register('orderNote')}
                placeholder="배송 시 요청사항을 입력해주세요 (선택사항)"
                rows={4}
              />
            </div>

            {/* 주문 버튼 */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? '주문 처리 중...' : '주문하기'}
              </Button>
            </div>
          </form>
        </SignedIn>
      </div>
    </div>
  );
}

