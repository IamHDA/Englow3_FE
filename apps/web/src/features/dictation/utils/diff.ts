import type { DiffItem, DiffResult } from "../types";

function cleanWord(word: string): string {
  return word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, "").trim().toLowerCase();
}

/**
 * Word alignment using Longest Common Subsequence (LCS)
 */
export function computeWordDiff(expectedText: string, actualText: string): DiffResult {
  const expectedTokens = expectedText.trim().split(/\s+/).filter(Boolean);
  const actualTokens = actualText.trim().split(/\s+/).filter(Boolean);

  if (expectedTokens.length === 0) {
    return {
      accuracyPercent: 100,
      correctWordsCount: 0,
      totalWordsCount: 0,
      mistakesCount: 0,
      items: [],
      fixes: [],
    };
  }

  // DP table for LCS
  const n = actualTokens.length;
  const m = expectedTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (cleanWord(actualTokens[i - 1]) === cleanWord(expectedTokens[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to get aligned items
  let i = n;
  let j = m;
  const reversedItems: DiffItem[] = [];
  const fixes: Array<{ from: string; to: string; strike: boolean }> = [];

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      cleanWord(actualTokens[i - 1]) === cleanWord(expectedTokens[j - 1])
    ) {
      reversedItems.push({
        text: actualTokens[i - 1],
        type: "ok",
        expected: expectedTokens[j - 1],
        actual: actualTokens[i - 1],
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i - 1][j - 1] >= dp[i - 1][j] && dp[i - 1][j - 1] >= dp[i][j - 1]) {
      // Direct replacement/mismatch
      reversedItems.push({
        text: actualTokens[i - 1],
        type: "bad",
        expected: expectedTokens[j - 1],
        actual: actualTokens[i - 1],
      });
      fixes.push({
        from: actualTokens[i - 1],
        to: expectedTokens[j - 1],
        strike: true,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Word is in expected but missing from actual
      reversedItems.push({
        text: `⌷ [${expectedTokens[j - 1]}]`,
        type: "missing",
        expected: expectedTokens[j - 1],
      });
      fixes.push({
        from: "missing",
        to: expectedTokens[j - 1],
        strike: false,
      });
      j--;
    } else {
      // Extra word in actual
      reversedItems.push({
        text: actualTokens[i - 1],
        type: "extra",
        actual: actualTokens[i - 1],
      });
      fixes.push({
        from: actualTokens[i - 1],
        to: "(extra)",
        strike: true,
      });
      i--;
    }
  }

  const items = reversedItems.reverse();
  const correctCount = items.filter((it) => it.type === "ok").length;
  const mistakesCount = items.filter((it) => it.type !== "ok").length;
  const totalCount = expectedTokens.length;

  const rawPercent = (correctCount / Math.max(totalCount, actualTokens.length)) * 100;
  const accuracyPercent = Math.max(0, Math.min(100, Math.round(rawPercent)));

  return {
    accuracyPercent,
    correctWordsCount: correctCount,
    totalWordsCount: totalCount,
    mistakesCount,
    items,
    fixes: fixes.reverse(),
  };
}
