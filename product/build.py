"""Build the Gate-to-Market app.

src/app.html is written for the claude.ai artifact viewer (no <html>/<head>/<body>
skeleton). This script also emits a standalone index.html for any static host.
"""
import pathlib
root = pathlib.Path(__file__).parent
src = (root / "src" / "app.html").read_text(encoding="utf-8")
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(src, encoding="utf-8")
standalone = ('<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              '</head>\n<body>\n' + src + '\n</body>\n</html>\n')
(root / "index.html").write_text(standalone, encoding="utf-8")
print("built dist/artifact.html and index.html")
