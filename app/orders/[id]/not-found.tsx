import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">주문을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">
          요청하신 주문이 존재하지 않거나 접근 권한이 없습니다.
        </p>
        <Link href="/orders">
          <Button>주문 목록으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}

