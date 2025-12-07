# 어드민 상품 등록 가이드

## 개요

MVP 단계에서는 별도의 어드민 페이지를 구현하지 않으며, Supabase 대시보드에서 직접 상품을 등록하고 관리합니다.

## 상품 등록 방법

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택

### 2. Table Editor로 이동

1. 좌측 메뉴에서 **Table Editor** 클릭
2. `products` 테이블 선택

### 3. 새 상품 추가

1. **Insert** → **Insert row** 클릭
2. 다음 정보 입력:

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `name` | TEXT | ✅ | 상품명 | "면 100% 기본 티셔츠" |
| `description` | TEXT | ❌ | 상품 설명 | "심플한 디자인, 5가지 컬러" |
| `price` | DECIMAL | ✅ | 가격 (0 이상) | 25000 |
| `category` | TEXT | ❌ | 카테고리 | "clothing", "electronics", "books", "food", "sports", "beauty", "home" |
| `stock_quantity` | INTEGER | ✅ | 재고 수량 (0 이상) | 300 |
| `is_active` | BOOLEAN | ✅ | 활성화 여부 | true |

**자동 생성 필드** (입력 불필요):
- `id`: UUID (자동 생성)
- `created_at`: TIMESTAMP (자동 생성)
- `updated_at`: TIMESTAMP (자동 갱신)

### 4. 상품 수정

1. 수정할 상품 행 클릭
2. 필드 값 수정
3. **Save** 클릭

### 5. 상품 비활성화 (삭제 대신)

상품을 완전히 삭제하지 않고 비활성화하려면:
1. 해당 상품의 `is_active` 필드를 `false`로 변경
2. 상품 목록에서 숨겨짐 (데이터는 유지)

## 카테고리 목록

사용 가능한 카테고리:

- `electronics` - 전자제품
- `clothing` - 의류
- `books` - 도서
- `food` - 식품
- `sports` - 스포츠
- `beauty` - 뷰티
- `home` - 생활/가정

## 주의사항

1. **가격**: 소수점 2자리까지 입력 가능 (예: 25000.50)
2. **재고**: 0 이상의 정수만 입력 가능
3. **카테고리**: 위 목록에 없는 카테고리를 입력해도 동작하지만, 한글명 매핑이 없을 수 있음
4. **상품명**: 중복 가능하지만, 사용자 경험을 위해 고유한 이름 권장

## 대량 등록 (SQL 사용)

여러 상품을 한 번에 등록하려면 **SQL Editor** 사용:

```sql
INSERT INTO products (name, description, price, category, stock_quantity) VALUES
('상품명 1', '설명 1', 25000, 'clothing', 100),
('상품명 2', '설명 2', 35000, 'electronics', 50),
('상품명 3', '설명 3', 15000, 'books', 30);
```

## 향후 개선 사항

- Phase 3 이후: 어드민 페이지 구현 예정
- 이미지 업로드 기능 추가 예정
- CSV 일괄 등록 기능 추가 예정

