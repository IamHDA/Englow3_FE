import { stepsFor } from "../stepsFor";

describe("stepsFor", () => {
  it("gives each role its own walkthrough", () => {
    expect(stepsFor("LEARNER", false)[0]?.target).toBe("learner-placement");
    expect(
      stepsFor("STAFF", false).every((s) => s.target.startsWith("admin-")),
    ).toBe(true);
    expect(stepsFor("ADMIN", false).length).toBeGreaterThan(0);
    expect(stepsFor(undefined, false)).toEqual([]);
  });

  it("drops the placement step once a placement result is on record", () => {
    const steps = stepsFor("LEARNER", true);
    expect(steps.some((s) => s.target === "learner-placement")).toBe(false);
    expect(steps.length).toBe(stepsFor("LEARNER", false).length - 1);
  });

  it("points every learner step somewhere in the app", () => {
    expect(stepsFor("LEARNER", false).every((s) => s.href !== null)).toBe(true);
  });
});
