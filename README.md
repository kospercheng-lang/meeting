# AI 模擬受訪者訪談自動化系統

以 Claude API 實作文件所描述的無程式碼 Zapier 流程，將 AI 同時作為「受訪者」與「稽核者」，自動產生大量模擬訪談逐字稿與品質回饋。

## 檔案結構

```
meeting/
├── interview_simulator.py   # 主程式（對應文件 Step1–Step5）
├── requirements.txt
└── data/
    ├── roles.csv            # 受訪角色檔案（對應 Zapier roles 工作表）
    ├── prompts.csv          # 訪談問題庫（對應 prompts 工作表）
    └── interview_queue.csv  # 訪談佇列（對應 interview_queue 工作表）
```

## 快速開始

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
python interview_simulator.py
```

執行後結果寫回 `data/interview_queue.csv`，並在 `output/interview_report.md` 產生 Markdown 報告。

## 流程對應

| 文件步驟 | 程式實作 |
|---|---|
| Step1 觸發器（監聽 pending 任務） | `load_queue()` 篩選 `status == "pending"` |
| Step2 查找角色與問題資料 | `load_csv("roles.csv")` / `load_csv("prompts.csv")` |
| Step3 AI 受訪者回答 | `generate_interviewee_response()` |
| Step4 AI 稽核專家審查 | `generate_audit_feedback()` |
| Step5 寫回資料庫 | `save_queue()` + `_export_report()` |

## 進階設定

- **多輪訪談**：`interview_queue.csv` 的「對話歷史」欄位以 JSON 保存上下文，可連續追問。
- **換用模型**：修改 `interview_simulator.py` 頂部的 `MODEL` 常數。
- **Rate Limit 控制**：呼叫 `run_interview_automation(rate_limit_delay=2.0)` 調整間隔秒數。
