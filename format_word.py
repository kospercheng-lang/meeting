#!/usr/bin/env python3
"""
Word 文件排版工具

上傳（指定）一份原始 .docx 檔案，依照台港公文常見格式自動套用：
  - 內文：新細明體（中文）/ Times New Roman（英文），12pt，行距 1.5 倍，首行縮排 2 字元
  - 標題（依 Word 內建 Heading 1/2/3 樣式階層）：黑體，粗體，字級依階層遞減

用法：
    python3 format_word.py 原始檔.docx
    python3 format_word.py 原始檔.docx -o 輸出檔.docx
"""

import argparse
import sys
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.shared import Pt, Cm
from docx.enum.text import WD_LINE_SPACING

BODY_FONT_EAST_ASIA = "標楷體"
BODY_FONT_ASCII = "Times New Roman"
BODY_SIZE = Pt(12)

HEADING_FONT_EAST_ASIA = "黑體"
HEADING_FONT_ASCII = "Times New Roman"
HEADING_SIZES = {
    1: Pt(16),  # 三號
    2: Pt(15),  # 小三
    3: Pt(14),  # 四號
}
HEADING_SIZE_DEFAULT = Pt(14)

LINE_SPACING = 1.5
FIRST_LINE_INDENT = Cm(0.74)  # 約中文 2 字元（12pt 字級）


def set_run_font(run, east_asia_name, ascii_name, size, bold=None):
    run.font.size = size
    run.font.name = ascii_name
    if bold is not None:
        run.font.bold = bold
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = rPr.makeelement(qn("w:rFonts"), {})
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), ascii_name)
    rFonts.set(qn("w:hAnsi"), ascii_name)
    rFonts.set(qn("w:eastAsia"), east_asia_name)


def heading_level(paragraph):
    style_name = paragraph.style.name if paragraph.style else ""
    if style_name.startswith("Heading "):
        try:
            return int(style_name.split(" ")[-1])
        except ValueError:
            return None
    if style_name in ("Title",):
        return 1
    return None


def format_paragraph(paragraph):
    level = heading_level(paragraph)

    pf = paragraph.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = LINE_SPACING

    if level:
        size = HEADING_SIZES.get(level, HEADING_SIZE_DEFAULT)
        pf.first_line_indent = None
        pf.space_before = Pt(12)
        pf.space_after = Pt(6)
        for run in paragraph.runs:
            set_run_font(run, HEADING_FONT_EAST_ASIA, HEADING_FONT_ASCII, size, bold=True)
    else:
        pf.first_line_indent = FIRST_LINE_INDENT
        pf.space_before = Pt(0)
        pf.space_after = Pt(0)
        for run in paragraph.runs:
            set_run_font(run, BODY_FONT_EAST_ASIA, BODY_FONT_ASCII, BODY_SIZE)


def iter_all_paragraphs(document):
    for paragraph in document.paragraphs:
        yield paragraph
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    yield paragraph


def format_document(input_path: Path, output_path: Path):
    document = Document(str(input_path))
    for paragraph in iter_all_paragraphs(document):
        format_paragraph(paragraph)
    document.save(str(output_path))


def main():
    parser = argparse.ArgumentParser(description="Word 文件自動排版工具")
    parser.add_argument("input", help="原始 .docx 檔案路徑")
    parser.add_argument("-o", "--output", help="輸出檔案路徑（預設為 原檔名_排版後.docx）")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"錯誤：找不到檔案 {input_path}", file=sys.stderr)
        sys.exit(1)
    if input_path.suffix.lower() != ".docx":
        print("錯誤：只支援 .docx 格式（若為 .doc 請先用 Word 另存為 .docx）", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output) if args.output else input_path.with_name(
        f"{input_path.stem}_排版後.docx"
    )

    format_document(input_path, output_path)
    print(f"完成！已輸出：{output_path}")


if __name__ == "__main__":
    main()
