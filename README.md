# 쇼핑몰 MVP

Next.js 15 + Clerk + Supabase + Toss Payments를 활용한 쇼핑몰 MVP 프로젝트입니다.

## 주요 기능

- ✅ 사용자 인증 (Clerk)
- ✅ 상품 조회 및 검색
- ✅ 장바구니 기능
- ✅ 주문 생성 및 관리
- ✅ 결제 통합 (Toss Payments - 테스트 모드)
- ✅ 주문 내역 조회

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **인증**: Clerk
- **데이터베이스**: Supabase (PostgreSQL)
- **결제**: Toss Payments (테스트 모드)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **폼 관리**: React Hook Form + Zod

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# Toss Payments (테스트 모드)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

### 2. 데이터베이스 마이그레이션

Supabase Dashboard의 SQL Editor에서 다음 마이그레이션 파일을 실행하세요:

- `supabase/migrations/schema.sql` (users 테이블)
- `supabase/migrations/20250101000000_create_shopping_mall_schema.sql` (상품, 장바구니, 주문 테이블)

### 3. 의존성 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── cart/              # 장바구니 페이지
│   ├── checkout/          # 주문 및 결제 페이지
│   ├── my/                # 마이페이지
│   ├── orders/            # 주문 내역 페이지
│   └── products/          # 상품 페이지
├── actions/               # Server Actions
│   ├── cart.ts           # 장바구니 액션
│   ├── orders.ts         # 주문 액션
│   └── payments.ts       # 결제 액션
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── ...
├── lib/                   # 유틸리티 및 설정
│   └── supabase/         # Supabase 클라이언트
├── types/                 # TypeScript 타입 정의
└── supabase/             # Supabase 마이그레이션
```

## 주요 페이지

- `/` - 홈 페이지 (프로모션, 카테고리, 인기 상품)
- `/products` - 상품 목록 (필터링, 정렬)
- `/products/[id]` - 상품 상세
- `/cart` - 장바구니
- `/checkout` - 주문 정보 입력
- `/checkout/[orderId]` - 결제 페이지
- `/orders` - 주문 내역 목록
- `/orders/[id]` - 주문 상세
- `/my` - 마이페이지

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 프로젝트 연결
2. 환경 변수 설정 (위의 환경 변수 목록 참고)
3. 배포 완료!

## 테스트 결제

Toss Payments 테스트 모드를 사용하므로 실제 결제가 발생하지 않습니다.

테스트 카드 정보:
- 카드번호: 1234-5678-9012-3456
- 유효기간: 12/34
- CVV: 123

## 라이선스

MIT
