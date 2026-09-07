import type { Metadata } from 'next';
import { ExamSittingView } from '@/features/exam';

export const metadata: Metadata = {
  title: 'Làm bài thi thử | Englow3',
  description: 'Trải nghiệm thi thử chứng chỉ tiếng Anh quốc tế TOEIC, IELTS với áp lực phòng thi thực tế tại Englow3.',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MockTestDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ExamSittingView examId={id} />;
}
