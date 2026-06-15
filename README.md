# 會議時間投票排程系統

一個讓大家填寫可以的時段、統計最高票、並自動發送 Google Calendar 邀請與 Email 通知的會議排程工具。

## 功能

1. **建立投票** - 設定會議標題、地點、候選時段、邀請參與者
2. **投票** - 每人填寫姓名與 Email，勾選可以的時段（可多選）
3. **統計結果** - 即時顯示票數長條圖，標示最高票時段
4. **確認會議** - 主辦人選定時段並確認，系統自動：
   - 關閉投票，鎖定時段
   - 發送 Google Calendar 行事曆邀請給所有參與者
   - 寄出 Gmail 通知

## 啟動方式

```bash
npm install
npm run dev
```

瀏覽器打開 http://localhost:3000

## 技術架構

- **前端/後端**: Next.js 16 (App Router)
- **樣式**: Tailwind CSS
- **資料儲存**: JSON 檔案 (`data/polls.json`)
- **行事曆通知**: Google Calendar API (透過 Claude MCP)
- **Email 通知**: Gmail API (透過 Claude MCP)
