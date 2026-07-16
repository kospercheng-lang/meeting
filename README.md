# KTV 伴唱室 🎤

一個網頁版KTV伴唱App：歌曲播放、歌詞同步捲動、麥克風跟唱評分、點歌排隊，以及多人房間同步播放。

## 專案結構

```
client/   React + Vite + TypeScript 前端
server/   Node.js + Express + Socket.io 後端（房間/排隊/同步）
scripts/  Demo歌曲產生器 & E2E測試腳本
```

Demo歌曲（`server/public/songs`）皆為本專案原創合成的免版權音樂與歌詞，
由 `scripts/generate-demo-songs.mjs` 產生（含伴奏WAV、LRC歌詞、音高評分資料）。

## 本機執行

```bash
# 後端
cd server
npm install
npm run dev        # http://localhost:4000

# 前端（另開一個終端機）
cd client
npm install
npm run dev         # http://localhost:5173
```

開啟 http://localhost:5173：建立房間取得房號，其他人用房號加入即可同房點歌、同步播放。

## 功能

- **點歌排隊**：搜尋demo曲庫，加入排隊清單，房主可播放/切換下一首
- **歌詞同步捲動**：依LRC時間軸自動捲動高亮目前歌詞行
- **麥克風跟唱評分**：以自相關演算法偵測音高，對照歌曲音高資料即時計分
- **多人房間同步**：房主為播放時鐘基準，其他成員自動校正播放進度（誤差 < 0.35 秒自動修正）

## 重新產生Demo歌曲

```bash
node scripts/generate-demo-songs.mjs
```

## 之後可以加強的方向

- 真實歌曲匯入（需自備版權音檔與LRC）
- 帳號系統 / 歷史紀錄
- 手機版UI優化、PWA離線快取
- 用WebSocket做即時聊天/彈幕
