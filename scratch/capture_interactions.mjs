import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "C:\\Users\\GIGABYTE\\.gemini\\antigravity-ide\\brain\\50fee016-bdf0-4d0f-a558-ded74a35c31e";

async function cdpRequest(ws, method, params = {}) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener("message", handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--window-size=1440,1200",
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const listData = await new Promise((resolve, reject) => {
    http.get("http://127.0.0.1:9222/json/list", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });

  const page = listData.find((p) => p.type === "page") || listData[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  await cdpRequest(ws, "Page.enable");
  await cdpRequest(ws, "Runtime.enable");

  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === "Runtime.consoleAPICalled") {
      console.log("[Browser Console]", ...msg.params.args.map((a) => a.value));
    }
  });

  // 1. Flip card in Flashcards
  console.log("Navigating to study...");
  await cdpRequest(ws, "Page.navigate", { url: "http://localhost:3000/study/flashcards/ielts-core-vocab/study" });
  await new Promise((r) => setTimeout(r, 2500));

  console.log("Flipping card...");
  await cdpRequest(ws, "Runtime.evaluate", {
    expression: `
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lật thẻ'));
      if (btn) btn.click();
      else {
        const card = document.querySelector('[class*="cardContainer"]');
        if (card) card.click();
      }
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  const shot1 = await cdpRequest(ws, "Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}\\flashcards_3d_study_flipped.png`, Buffer.from(shot1.data, "base64"));
  console.log("Captured flashcards_3d_study_flipped.png");

  // 2. Pronunciation recording & score card
  console.log("Navigating to pronunciation lesson...");
  await cdpRequest(ws, "Page.navigate", { url: "http://localhost:3000/study/pronunciation/minimal-pair-i-long-short" });
  await new Promise((r) => setTimeout(r, 2500));

  console.log("Triggering recording...");
  const res = await cdpRequest(ws, "Runtime.evaluate", {
    expression: `
      (() => {
        const micBtn = document.querySelector('[data-testid="mic-record-btn"]') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg'));
        if (micBtn) {
          micBtn.click();
          return 'clicked: ' + micBtn.tagName + ' / ' + micBtn.className;
        }
        return 'no_btn_found';
      })()
    `,
  });
  console.log("Mic click result:", res);

  console.log("Waiting for AI analysis to complete...");
  await new Promise((r) => setTimeout(r, 6500));

  const shot2 = await cdpRequest(ws, "Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}\\pronunciation_score_card.png`, Buffer.from(shot2.data, "base64"));
  console.log("Captured pronunciation_score_card.png");

  // 3. Quiz submission and review
  console.log("Navigating to quiz...");
  await cdpRequest(ws, "Page.navigate", { url: "http://localhost:3000/study/quiz/ielts-academic-grammar" });
  await new Promise((r) => setTimeout(r, 2500));

  console.log("Answering Q1 and submitting...");
  await cdpRequest(ws, "Runtime.evaluate", {
    expression: `
      // Click option A
      const optA = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('when'));
      if (optA) optA.click();

      // Click submit quiz
      setTimeout(() => {
        const subBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Nộp bài'));
        if (subBtn) subBtn.click();

        setTimeout(() => {
          const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Xác nhận'));
          if (confirmBtn) confirmBtn.click();
        }, 500);
      }, 500);
    `,
  });

  await new Promise((r) => setTimeout(r, 2500));

  const shot3 = await cdpRequest(ws, "Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${outDir}\\quiz_results_summary.png`, Buffer.from(shot3.data, "base64"));
  console.log("Captured quiz_results_summary.png");

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
