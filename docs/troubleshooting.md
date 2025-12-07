# 문제 해결 가이드

## Supabase 연결 에러

### 증상
- 콘솔에 "Error fetching featured products: {}" 또는 "Error fetching categories: {}" 에러 발생
- 홈 페이지는 표시되지만 상품이 보이지 않음

### 원인
1. **데이터베이스 마이그레이션이 실행되지 않음** (가장 흔한 원인)
2. 환경 변수가 설정되지 않음
3. Supabase 프로젝트 연결 문제

### 해결 방법

#### 1. 마이그레이션 실행 확인

Supabase Dashboard에서 마이그레이션 파일을 실행해야 합니다:

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. 다음 파일 내용을 복사하여 붙여넣기:
   - `supabase/migrations/20250101000000_create_shopping_mall_schema.sql`
6. **Run** 버튼 클릭
7. 성공 메시지 확인 (`Success. No rows returned`)

#### 2. 환경 변수 확인

`.env.local` 파일이 프로젝트 루트에 있고, 다음 변수들이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**확인 방법:**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일 내용에 위 변수들이 있는지 확인
- 값이 비어있지 않은지 확인

#### 3. 개발 서버 재시작

환경 변수를 변경했다면 반드시 개발 서버를 재시작하세요:

```bash
# 터미널에서 Ctrl+C로 서버 중지
# 그 다음 다시 시작
pnpm dev
```

#### 4. Supabase 프로젝트 연결 확인

1. Supabase Dashboard에서 프로젝트가 활성화되어 있는지 확인
2. 프로젝트 URL과 API 키가 올바른지 확인
3. 네트워크 연결 확인

### 테이블 존재 확인

Supabase Dashboard → Table Editor에서 다음 테이블들이 있는지 확인:
- ✅ `products`
- ✅ `cart_items`
- ✅ `orders`
- ✅ `order_items`

테이블이 없다면 마이그레이션을 실행하세요.

### 추가 디버깅

터미널에서 더 자세한 에러 정보를 확인할 수 있습니다:

1. 개발 서버 실행 중인 터미널 확인
2. 에러 메시지의 전체 내용 확인
3. 특히 "relation" 또는 "does not exist" 키워드가 있는지 확인

### 여전히 문제가 있다면

1. 브라우저 콘솔과 서버 터미널의 전체 에러 메시지를 확인
2. Supabase Dashboard → Logs에서 에러 로그 확인
3. 환경 변수가 올바르게 로드되는지 확인:
   ```bash
   # 터미널에서 확인 (실제 값은 표시되지 않음)
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

