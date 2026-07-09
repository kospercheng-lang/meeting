# meeting
meeting survey

## Word 排版工具 (format_word.py)

自動將 .docx 文件排成台港公文/會議紀錄常見格式：

- 內文：新細明體（中文）/ Times New Roman（英文），12pt，1.5 倍行距，首行縮排 2 字元
- 標題：依原檔的 Heading 1/2/3 樣式階層，套用黑體、粗體，字級 16pt/15pt/14pt

### 安裝

```bash
pip install -r requirements.txt
```

### 使用方式

```bash
python3 format_word.py 原始檔.docx
# 或指定輸出檔名
python3 format_word.py 原始檔.docx -o 輸出檔.docx
```

預設輸出檔名為 `原檔名_排版後.docx`，不會覆蓋原始檔案。

> 標題階層是依照原始 Word 檔中是否已套用「Heading 1 / Heading 2 / Heading 3」樣式來辨識；若原檔全是純文字段落，則整份文件會視為內文套用格式。
