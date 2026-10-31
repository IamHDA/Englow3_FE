"use client";

import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

// Từ "hooks" chứ không qua barrel: barrel cố ý không re-export hooks để Server
// Component không kéo theo "@apollo/client/react".
import {
  DictationLessonsDocument,
  type DictationLessonsQuery,
  useDictationLessonsQuery,
} from "@/lib/graphql/generated/hooks";

/** Lớn nhất mà server cho một trang (`spring.data.web.pageable.max-page-size`). */
const PAGE_SIZE = 100;

type Lesson = DictationLessonsQuery["dictationLessons"]["items"][number];

/**
 * Cả thư viện bài nghe chép, không chỉ trang đầu.
 *
 * Màn thư viện lọc và sắp xếp tại chỗ, nên nó cần đủ mọi bài trong tay: một
 * trang cố định làm bài thứ năm mươi mốt trở đi biến mất khỏi bộ lọc mà không
 * báo gì. Trang đầu lấy qua query thường (nên có skeleton và cache như trước),
 * các trang còn lại được kéo nối tiếp ngay sau đó.
 */
export function useAllDictationLessons() {
  const client = useApolloClient();
  const { data, loading, error } = useDictationLessonsQuery({
    variables: { size: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const first = data?.dictationLessons;
  const totalPages = first?.totalPages ?? 0;
  // Gắn với tổng số bài: thêm hay bớt một bài thì tải lại các trang sau.
  const signature = `${totalPages}:${first?.totalItems ?? 0}`;
  const [rest, setRest] = useState<{ signature: string; items: Lesson[] }>({
    signature: "",
    items: [],
  });

  useEffect(() => {
    if (totalPages <= 1) return;
    let cancelled = false;
    (async () => {
      const items: Lesson[] = [];
      for (let page = 1; page < totalPages; page += 1) {
        const result = await client.query<DictationLessonsQuery>({
          query: DictationLessonsDocument,
          variables: { size: PAGE_SIZE, page },
          fetchPolicy: "network-only",
        });
        items.push(...(result.data?.dictationLessons.items ?? []));
      }
      if (!cancelled) setRest({ signature, items });
    })().catch(() => {
      // Trang đầu đã hiện; thiếu các trang sau tốt hơn là mất cả màn hình.
    });
    return () => {
      cancelled = true;
    };
  }, [client, signature, totalPages]);

  const lessons = useMemo(
    () => [
      ...(first?.items ?? []),
      ...(rest.signature === signature ? rest.items : []),
    ],
    [first, rest, signature],
  );

  return { lessons, loading, error, totalItems: first?.totalItems ?? 0 };
}
