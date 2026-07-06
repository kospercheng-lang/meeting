"""
AI 模擬受訪者訪談自動化系統
對應文件流程：Step1 觸發 → Step2 抓取資料 → Step3 AI受訪者回答 → Step4 AI稽核 → Step5 寫回資料庫
"""

import anthropic
import csv
import json
import time
from pathlib import Path

DATA_DIR = Path("data")
OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

MODEL = "claude-haiku-4-5-20251001"  # 測試階段用輕量模型；正式可換 claude-sonnet-5


def load_csv(filename: str) -> dict[str, dict]:
    """讀取 CSV 並以第一欄 ID 為 key 回傳字典。"""
    rows = {}
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            first_key = list(row.keys())[0]
            rows[row[first_key]] = row
    return rows


def save_queue(queue: list[dict], filename: str = "interview_queue.csv") -> None:
    """將更新後的佇列寫回 CSV。"""
    if not queue:
        return
    with open(DATA_DIR / filename, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=queue[0].keys())
        writer.writeheader()
        writer.writerows(queue)


def load_queue(filename: str = "interview_queue.csv") -> list[dict]:
    """讀取訪談佇列，回傳所有任務列表。"""
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ── Step 3：AI 扮演受訪者產生回答 ──────────────────────────────────────────

def generate_interviewee_response(
    client: anthropic.Anthropic,
    role: dict,
    question: dict,
    conversation_history: list[dict],
) -> str:
    system_prompt = f"""你是一位真實的受訪者，請嚴格依照以下角色檔案扮演，用第一人稱自然回答訪談問題。

【角色檔案】
- 角色：{role['角色名稱']}
- 組織背景：{role['組織背景']}
- 主要目標：{role['主要目標']}
- KPI：{role['KPI']}
- 預算壓力：{role['預算壓力']}
- 隱憂：{role['隱憂']}

【回答規則】
1. 用繁體中文回答，口吻自然口語，像真人說話。
2. 回答長度約 150-250 字。
3. 若問題提到的方案無助於解決你的 KPI，請直接質疑或拒絕，絕對不要盲目同意。
4. 適時透露你的真實顧慮與隱憂，但不要一次全盤托出。
5. 不要提及你是 AI 或角色扮演。"""

    messages = conversation_history.copy()
    messages.append({"role": "user", "content": question["問題內容"]})

    response = client.messages.create(
        model=MODEL,
        max_tokens=600,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text


# ── Step 4：AI 扮演稽核專家審查回答 ────────────────────────────────────────

def generate_audit_feedback(
    client: anthropic.Anthropic,
    role: dict,
    question: dict,
    answer: str,
) -> str:
    system_prompt = """你是一位資深使用者研究專家，負責稽核 AI 模擬訪談的回答品質。
請以客觀、批判的角度分析受訪者回答，並提供具體的改善建議。"""

    user_content = f"""【受訪者角色】{role['角色名稱']}（{role['組織背景']}）
【訪談問題】（{question['問題類型']}）{question['問題內容']}
【受訪者回答】
{answer}

請依以下四個維度給出稽核意見（各 1-2 句）：
1. 角色一致性：回答是否符合該角色的背景、KPI 與隱憂？
2. 真實性：口吻是否自然？有無 AI 痕跡或過於完美的答案？
3. 資訊密度：是否透露了足夠的洞察，還是回答太表面？
4. 追問建議：下一個最值得追問的問題是什麼？"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    return response.content[0].text


# ── 主流程 ──────────────────────────────────────────────────────────────────

def run_interview_automation(rate_limit_delay: float = 1.0) -> None:
    """
    主自動化流程，對應文件 Step1～Step5：
    Step1: 找出 pending 任務（觸發器）
    Step2: 查找角色與問題資料
    Step3: 生成受訪者回答
    Step4: 生成稽核意見
    Step5: 寫回資料庫並輸出報告
    """
    client = anthropic.Anthropic()

    # Step 1：載入資料（觸發器：找出所有 pending 任務）
    roles = load_csv("roles.csv")
    prompts = load_csv("prompts.csv")
    queue = load_queue()

    pending_tasks = [t for t in queue if t["狀態"] == "pending"]
    print(f"找到 {len(pending_tasks)} 個待執行訪談任務\n")

    completed_count = 0

    for task in queue:
        if task["狀態"] != "pending":
            continue

        task_id = task["任務ID"]
        role_id = task["角色ID"]
        question_id = task["問題ID"]

        # Step 2：查找角色與問題資料
        role = roles.get(role_id)
        question = prompts.get(question_id)

        if not role or not question:
            print(f"[{task_id}] 找不到角色 {role_id} 或問題 {question_id}，跳過。")
            task["狀態"] = "error"
            continue

        print(f"[{task_id}] 角色：{role['角色名稱']} × 問題：{question['問題ID']} ({question['問題類型']})")
        print(f"  問題：{question['問題內容']}")

        # 還原對話歷史（支援多輪訪談）
        history_raw = task.get("對話歷史", "").strip()
        conversation_history = json.loads(history_raw) if history_raw else []

        # Step 3：AI 扮演受訪者產生回答
        answer = generate_interviewee_response(client, role, question, conversation_history)
        print(f"  受訪者回答：{answer[:80]}...")

        # 加進對話歷史，保留上下文供後續多輪使用
        conversation_history.append({"role": "user", "content": question["問題內容"]})
        conversation_history.append({"role": "assistant", "content": answer})

        time.sleep(rate_limit_delay)  # 避免 rate limit

        # Step 4：AI 扮演稽核專家審查回答
        audit = generate_audit_feedback(client, role, question, answer)
        print(f"  稽核意見：{audit[:80]}...")

        # Step 5：寫回資料庫
        task["AI回答"] = answer
        task["稽核意見"] = audit
        task["對話歷史"] = json.dumps(conversation_history, ensure_ascii=False)
        task["狀態"] = "completed"

        completed_count += 1
        print(f"  ✓ 完成\n")

        time.sleep(rate_limit_delay)

    # 儲存更新後的佇列
    save_queue(queue)

    # 輸出訪談報告
    _export_report(queue, roles, prompts)

    print(f"全部完成！共處理 {completed_count} 個任務。")
    print(f"報告已存至 output/interview_report.md")


def _export_report(queue: list[dict], roles: dict, prompts: dict) -> None:
    """將完成的訪談整理成 Markdown 報告。"""
    lines = ["# AI 模擬訪談報告\n"]

    completed = [t for t in queue if t["狀態"] == "completed"]
    lines.append(f"完成任務數：{len(completed)}\n\n---\n")

    for task in completed:
        role = roles.get(task["角色ID"], {})
        question = prompts.get(task["問題ID"], {})

        lines.append(f"## 任務 {task['任務ID']}：{role.get('角色名稱', '')} × {task['問題ID']}")
        lines.append(f"\n**問題類型**：{question.get('問題類型', '')}")
        lines.append(f"\n**問題**：{question.get('問題內容', '')}\n")
        lines.append(f"\n### 受訪者回答\n\n{task['AI回答']}\n")
        lines.append(f"\n### 稽核意見\n\n{task['稽核意見']}\n")
        lines.append("\n---\n")

    report_path = OUTPUT_DIR / "interview_report.md"
    report_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    run_interview_automation()
