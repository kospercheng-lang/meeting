import { chromium } from "playwright";

const BASE = "http://localhost:5173";

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });

  const hostCtx = await browser.newContext({ permissions: ["microphone"] });
  const guestCtx = await browser.newContext({ permissions: ["microphone"] });
  const hostPage = await hostCtx.newPage();
  const guestPage = await guestCtx.newPage();

  hostPage.on("console", (m) => console.log("[host console]", m.type(), m.text()));
  hostPage.on("pageerror", (e) => console.log("[host pageerror]", e.message));
  guestPage.on("pageerror", (e) => console.log("[guest pageerror]", e.message));

  console.log("1. host opens app, creates room");
  await hostPage.goto(BASE);
  await hostPage.getByPlaceholder("例如：小明").fill("房主小李");
  await hostPage.getByRole("button", { name: "建立房間" }).last().click();
  await hostPage.getByRole("button", { name: "🎧 點擊進入房間" }).click({ timeout: 10000 });

  const roomCode = await hostPage.locator("span.font-mono").innerText();
  console.log("   room code:", roomCode);
  if (!/^[A-Z0-9]{5}$/.test(roomCode)) throw new Error("room code looks wrong: " + roomCode);

  console.log("2. guest opens app, joins room " + roomCode);
  await guestPage.goto(BASE);
  await guestPage.getByRole("button", { name: "加入房間" }).first().click();
  await guestPage.getByPlaceholder("例如：小明").fill("觀眾阿花");
  await guestPage.getByPlaceholder("例如：AB3C9").fill(roomCode);
  await guestPage.getByRole("button", { name: "加入房間" }).last().click();
  await guestPage.getByRole("button", { name: "🎧 點擊進入房間" }).click({ timeout: 10000 });

  console.log("3. host checks member list shows both");
  await hostPage.waitForFunction(
    () => document.body.innerText.includes("房間成員 (2)"),
    { timeout: 5000 }
  );
  console.log("   OK: 2 members visible");

  console.log("4. host adds a song to the queue");
  await hostPage.getByRole("button", { name: "➕ 加入" }).first().click();
  await hostPage.waitForFunction(
    () => document.body.innerText.includes("排隊清單 (1)"),
    { timeout: 5000 }
  );
  console.log("   OK: queue has 1 item");

  console.log("5. host plays the queued song");
  await hostPage.getByRole("button", { name: "▶️ 播放排隊中的第一首" }).click();
  await hostPage.waitForSelector("h2:has-text('夏夜微風')", { timeout: 5000 });
  console.log("   OK: now playing 夏夜微風");

  console.log("6. waiting for playback + lyric sync to progress...");
  await hostPage.waitForTimeout(4000);

  const hostTime = await hostPage.locator("audio").evaluate((el) => el.currentTime);
  console.log("   host audio currentTime:", hostTime);
  if (hostTime < 1) throw new Error("host audio does not seem to be playing");

  console.log("7. checking guest received sync and is playing too");
  await guestPage.waitForFunction(
    () => {
      const audio = document.querySelector("audio");
      return audio && audio.currentTime > 1;
    },
    { timeout: 8000 }
  );
  const guestTime = await guestPage.locator("audio").evaluate((el) => el.currentTime);
  console.log("   guest audio currentTime:", guestTime);
  const drift = Math.abs(guestTime - hostTime);
  console.log("   drift between host/guest (approx, not same instant):", drift.toFixed(2), "s");

  console.log("8. checking active lyric line highlighted");
  const activeLyric = await hostPage.locator("p.scale-105").first().innerText();
  console.log("   active lyric line:", activeLyric);
  if (!activeLyric) throw new Error("no active lyric line found");

  console.log("9. guest starts mic scoring");
  await guestPage.getByRole("button", { name: "🎤 開始跟唱評分" }).click();
  await guestPage.waitForTimeout(2000);
  await guestPage.getByRole("button", { name: "⏹ 結束並送出分數" }).click();
  await guestPage.waitForFunction(
    () => document.body.innerText.includes("最終得分"),
    { timeout: 5000 }
  );
  console.log("   OK: final score shown");

  console.log("10. host checks score record appeared in scoreboard");
  await hostPage.waitForFunction(
    () => document.body.innerText.includes("觀眾阿花"),
    { timeout: 5000 }
  );
  console.log("   OK: scoreboard shows guest score");

  console.log("\nALL CHECKS PASSED");
  await browser.close();
})().catch((e) => {
  console.error("E2E TEST FAILED:", e);
  process.exit(1);
});
