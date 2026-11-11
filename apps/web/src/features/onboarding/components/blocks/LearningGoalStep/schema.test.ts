import { describe, expect, it } from "vitest";
import { learningGoalSchema } from "./schema";
import { TargetCertificate } from "@/lib/graphql/generated";

const goal = {
  certificateType: TargetCertificate.IELTS,
  targetScore: "",
  targetLevel: "",
  dailyStudyMinutes: "30",
  targetDate: "",
};
describe("learning goal requirements", () => {
  it("requires a target score for certificate roadmaps", () => {
    expect(learningGoalSchema(true, false, true).safeParse(goal).success).toBe(
      false,
    );
    expect(
      learningGoalSchema(true, false, true).safeParse({
        ...goal,
        targetScore: "7",
      }).success,
    ).toBe(true);
  });
  it("requires a CEFR goal only when a higher level exists", () => {
    expect(learningGoalSchema(true, true).safeParse(goal).success).toBe(false);
    expect(learningGoalSchema(true, false).safeParse(goal).success).toBe(true);
  });
  it("rejects non-finite values and scores off the chosen scale", () => {
    for (const targetScore of ["0", "Infinity", "6.3", "10"]) {
      expect(
        learningGoalSchema(true, false, true).safeParse({
          ...goal,
          targetScore,
        }).success,
      ).toBe(false);
    }
  });
});
