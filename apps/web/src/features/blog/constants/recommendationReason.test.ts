import { describe, expect, it } from "vitest";

import { BlogRecommendationKind, BlogTagKind } from "@/lib/graphql/generated";
import { blogVi } from "@/shared/constants/translations/blog";
import { blogEn } from "@/shared/constants/translations/blog.en";

import { recommendationReason } from "./blogLabels";

const skill = (value: string) => ({ kind: BlogTagKind.SKILL, value });
const level = (value: string) => ({ kind: BlogTagKind.LEVEL, value });
const certificate = (value: string) => ({
  kind: BlogTagKind.CERTIFICATE,
  value,
});
const words = (value: string) =>
  ({ SPEAKING: "Nói", LISTENING: "Nghe" })[value] ?? value;

const reason = (
  matched: Array<{ kind: BlogTagKind; value: string }>,
  kind = BlogRecommendationKind.PROFILE,
) => recommendationReason(blogVi, kind, matched, words);

describe("recommendationReason", () => {
  it("says a popular post is about the week, whatever else came with it", () => {
    expect(
      reason([certificate("IELTS")], BlogRecommendationKind.POPULAR_THIS_WEEK),
    ).toBe("Được yêu thích tuần này");
  });

  it("says a latest post is only new, in both languages", () => {
    expect(reason([], BlogRecommendationKind.LATEST)).toBe("Mới đăng gần đây");
    expect(
      recommendationReason(blogEn, BlogRecommendationKind.LATEST, [], words),
    ).toBe("Recently posted");
  });

  it("names each thing that matched, worded for that combination", () => {
    expect(reason([certificate("IELTS")])).toBe("Vì bạn đang luyện IELTS");
    expect(reason([skill("SPEAKING")])).toBe("Vì bạn muốn cải thiện Nói");
    expect(reason([level("B1")])).toBe("Phù hợp trình độ B1 của bạn");
    expect(reason([skill("SPEAKING"), certificate("IELTS")])).toBe(
      "Vì bạn đang luyện IELTS · muốn cải thiện Nói",
    );
    expect(reason([level("B1"), certificate("TOEIC")])).toBe(
      "Vì bạn đang luyện TOEIC · trình độ B1",
    );
    expect(reason([skill("LISTENING"), level("B1")])).toBe(
      "Vì bạn muốn cải thiện Nghe · B1",
    );
    expect(
      reason([
        skill("LISTENING"),
        skill("SPEAKING"),
        level("B2"),
        certificate("IELTS"),
      ]),
    ).toBe("Vì bạn đang luyện IELTS · muốn cải thiện Nghe, Nói · B2");
  });

  it("is worded in the language it is given", () => {
    expect(
      recommendationReason(
        blogEn,
        BlogRecommendationKind.PROFILE,
        [certificate("IELTS")],
        words,
      ),
    ).toBe("Because you are preparing for IELTS");
  });

  it("falls back to a plain line for a fit that names nothing", () => {
    expect(reason([])).toBe("Gợi ý cho bạn");
  });
});
