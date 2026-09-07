import { Button, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Search } from "lucide-react";

type ExamEmptyStateProps = {
  searchQuery?: string;
  onResetFilters: () => void;
};

export function ExamEmptyState({
  searchQuery,
  onResetFilters,
}: ExamEmptyStateProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: "xl", sm: 54 }}
      shadow="xs"
      bg="white"
    >
      <Stack align="center" gap="md" ta="center">
        <ThemeIcon size={64} radius="xl" variant="light" color="blue">
          <Search size={28} aria-hidden="true" />
        </ThemeIcon>

        <Title order={3} fw={700} c="navy.9">
          Không tìm thấy đề thi phù hợp
        </Title>

        <Text c="dimmed" size="sm" maw={460} lh={1.6}>
          {searchQuery
            ? `Không có đề thi nào khớp với từ khoá "${searchQuery}". Thử điều chỉnh từ khoá hoặc xoá bớt các bộ lọc để xem nhiều kết quả hơn.`
            : "Không có đề thi nào thoả mãn các điều kiện lọc hiện tại. Thử bỏ chọn một vài bộ lọc để xem danh sách đề."}
        </Text>

        <Button
          variant="filled"
          color="navy.9"
          radius="xl"
          size="sm"
          mt="xs"
          onClick={onResetFilters}
        >
          Xoá toàn bộ bộ lọc
        </Button>
      </Stack>
    </Paper>
  );
}
