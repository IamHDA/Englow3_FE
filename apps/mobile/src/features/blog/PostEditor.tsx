import { router } from "expo-router";
import { useState } from "react";

import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  BlogTagKind,
  useBlogTagCatalogueQuery,
  useCreateBlogPostMutation,
  useStartBlogImageUploadMutation,
  useUpdateBlogPostMutation,
  type BlogTagInput,
} from "@/lib/graphql/generated";
import { pickImage } from "@/lib/pickImage";
import { uploadToSignedUrl } from "@/lib/upload";
import {
  AppText,
  Button,
  Chip,
  ChipRow,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

import {
  IMAGE_MAX_BYTES,
  MAX_BODY_LENGTH,
  MAX_IMAGES,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  imageMarkdown,
  imageReferenceIds,
} from "./markdown";

const BLOG_ERRORS: Record<string, string> = {
  BLOG_POST_VERSION_CONFLICT:
    "Bài viết vừa được sửa ở nơi khác. Hãy mở lại để sửa trên bản mới nhất.",
  BLOG_TOO_MANY_IMAGES: `Mỗi bài tối đa ${MAX_IMAGES} ảnh.`,
  BLOG_IMAGE_TOO_LARGE: "Ảnh quá lớn (tối đa 5 MB).",
  BLOG_RATE_LIMITED: "Bạn đăng bài hơi nhanh. Đợi một lát rồi thử lại.",
};

type Initial = {
  id: string;
  version: number;
  title: string;
  body: string;
  tags: BlogTagInput[];
};

/** Write or edit a post: Markdown body, photos inserted as references, up to eight tags. */
export function PostEditor({ initial }: { initial?: Initial }) {
  const catalogue = useBlogTagCatalogueQuery();
  const [create, createState] = useCreateBlogPostMutation();
  const [update, updateState] = useUpdateBlogPostMutation();
  const [startUpload] = useStartBlogImageUploadMutation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState<BlogTagInput[]>(initial?.tags ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saving = createState.loading || updateState.loading;

  const toggleTag = (kind: BlogTagKind, value: string) =>
    setTags((current) => {
      const exists = current.some(
        (tag) => tag.kind === kind && tag.value === value,
      );
      if (exists)
        return current.filter(
          (tag) => !(tag.kind === kind && tag.value === value),
        );
      return current.length >= MAX_TAGS
        ? current
        : [...current, { kind, value }];
    });

  async function addImage() {
    setError(null);
    if (imageReferenceIds(body).length >= MAX_IMAGES) {
      setError(`Mỗi bài tối đa ${MAX_IMAGES} ảnh.`);
      return;
    }
    const picked = await pickImage({ maxBytes: IMAGE_MAX_BYTES });
    if (!picked) return;
    if ("error" in picked) {
      setError(picked.error);
      return;
    }
    setUploading(true);
    try {
      const { data } = await startUpload({
        variables: {
          contentType: picked.contentType,
          contentLength: picked.bytes.byteLength,
        },
      });
      if (!data) throw new Error("No upload ticket");
      await uploadToSignedUrl(
        data.startBlogImageUpload.uploadUrl,
        data.startBlogImageUpload.contentType,
        picked.bytes,
      );
      setBody(
        (current) =>
          `${current}${current.endsWith("\n") || !current ? "" : "\n\n"}${imageMarkdown(data.startBlogImageUpload.reference, "ảnh")}\n`,
      );
    } catch (failure) {
      setError(errorMessage(failure, BLOG_ERRORS));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setError(null);
    if (!title.trim()) return setError("Hãy đặt tiêu đề cho bài viết.");
    if (!body.trim()) return setError("Bài viết chưa có nội dung.");
    const input = { title: title.trim(), body, tags };
    try {
      if (initial) {
        await update({
          variables: { id: initial.id, input, version: initial.version },
        });
        router.back();
      } else {
        const { data } = await create({ variables: { input } });
        if (data)
          router.replace({
            pathname: "/blog/[postId]",
            params: { postId: data.createBlogPost.id },
          });
      }
    } catch (failure) {
      setError(
        BLOG_ERRORS[backendCodeOf(failure) ?? ""] ?? errorMessage(failure),
      );
    }
  }

  const groups: [BlogTagKind, string, string[]][] = [
    [
      BlogTagKind.SKILL,
      "Kỹ năng",
      catalogue.data?.blogTagCatalogue.skills ?? [],
    ],
    [
      BlogTagKind.LEVEL,
      "Trình độ",
      catalogue.data?.blogTagCatalogue.levels ?? [],
    ],
    [
      BlogTagKind.CERTIFICATE,
      "Chứng chỉ",
      catalogue.data?.blogTagCatalogue.certificates ?? [],
    ],
  ];

  return (
    <Screen>
      <Notice message={error} />
      <TextField
        label="Tiêu đề"
        value={title}
        onChangeText={setTitle}
        maxLength={MAX_TITLE_LENGTH}
      />
      <TextField
        label="Nội dung"
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={MAX_BODY_LENGTH}
        style={{ minHeight: 240 }}
        hint="Hỗ trợ Markdown: **đậm**, *nghiêng*, # tiêu đề, - danh sách."
      />
      <Row gap={spacing.sm} style={{ marginBottom: spacing.md }}>
        <Button
          title="Chèn ảnh"
          icon="image-outline"
          variant="secondary"
          size="sm"
          loading={uploading}
          onPress={() => void addImage()}
        />
        <AppText variant="caption" tone="muted">
          {imageReferenceIds(body).length}/{MAX_IMAGES} ảnh · {body.length}/
          {MAX_BODY_LENGTH} ký tự
        </AppText>
      </Row>
      <AppText variant="label">
        Thẻ ({tags.length}/{MAX_TAGS})
      </AppText>
      {groups.map(([kind, label, values]) =>
        values.length ? (
          <ChipRow key={kind}>
            <AppText
              variant="caption"
              tone="muted"
              style={{ alignSelf: "center" }}
            >
              {label}:
            </AppText>
            {values.map((value) => (
              <Chip
                key={value}
                label={value}
                selected={tags.some(
                  (tag) => tag.kind === kind && tag.value === value,
                )}
                onPress={() => toggleTag(kind, value)}
              />
            ))}
          </ChipRow>
        ) : null,
      )}
      <Button
        title={initial ? "Lưu thay đổi" : "Đăng bài"}
        loading={saving}
        disabled={uploading}
        onPress={() => void submit()}
      />
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginTop: spacing.sm, textAlign: "center" }}
      >
        Bài viết có thể cần được duyệt trước khi hiện công khai.
      </AppText>
    </Screen>
  );
}
