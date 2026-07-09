#!/usr/bin/env python3
"""
Word 排版工具 - 網頁版

上傳 .docx 檔案，自動套用排版規則後提供下載。
"""

import tempfile
from pathlib import Path

from flask import Flask, request, send_file, render_template_string, flash, redirect, url_for
from werkzeug.utils import secure_filename

from format_word import format_document

app = Flask(__name__)
app.secret_key = "word-formatter-dev-key"
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB

PAGE = """
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>Word 排版工具</title>
<style>
  body { font-family: "Microsoft JhengHei", sans-serif; max-width: 560px; margin: 60px auto; padding: 0 20px; }
  h1 { font-size: 1.4rem; }
  .rules { background: #f5f5f5; border-radius: 8px; padding: 16px 20px; font-size: 0.9rem; color: #444; }
  .dropzone { border: 2px dashed #999; border-radius: 8px; padding: 40px; text-align: center; margin: 24px 0; }
  input[type=file] { margin: 12px 0; }
  button { background: #2563eb; color: #fff; border: none; padding: 10px 24px; border-radius: 6px; font-size: 1rem; cursor: pointer; }
  button:hover { background: #1d4ed8; }
  .flash { color: #b91c1c; margin: 12px 0; }
</style>
</head>
<body>
  <h1>Word 排版工具</h1>
  <div class="rules">
    <strong>套用規則：</strong><br>
    內文：標楷體（中文）/ Times New Roman（英文）12pt，1.5 倍行距，首行縮排 2 字元<br>
    標題：依原檔 Heading 1/2/3 樣式，套用黑體、粗體，16pt/15pt/14pt
  </div>
  {% with messages = get_flashed_messages() %}
    {% if messages %}
      {% for m in messages %}<div class="flash">{{ m }}</div>{% endfor %}
    {% endif %}
  {% endwith %}
  <form method="post" action="/format" enctype="multipart/form-data">
    <div class="dropzone">
      <p>選擇要排版的 .docx 檔案</p>
      <input type="file" name="file" accept=".docx" required>
    </div>
    <button type="submit">上傳並排版</button>
  </form>
</body>
</html>
"""


@app.get("/")
def index():
    return render_template_string(PAGE)


@app.post("/format")
def format_upload():
    uploaded = request.files.get("file")
    if uploaded is None or uploaded.filename == "":
        flash("請先選擇一個 .docx 檔案")
        return redirect(url_for("index"))

    filename = secure_filename(uploaded.filename)
    if not filename.lower().endswith(".docx"):
        flash("只支援 .docx 格式，請先用 Word 另存新檔為 .docx")
        return redirect(url_for("index"))

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / filename
        uploaded.save(input_path)

        output_name = f"{input_path.stem}_排版後.docx"
        output_path = Path(tmpdir) / output_name

        try:
            format_document(input_path, output_path)
        except Exception:
            flash("排版失敗，請確認檔案是否為有效的 .docx 檔")
            return redirect(url_for("index"))

        return send_file(
            output_path,
            as_attachment=True,
            download_name=output_name,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
