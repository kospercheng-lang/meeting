# 無人化科技 新創情報探勘報告

以 AI 模型 **Signal Atlas** 掃描全球 76,898 家新創公司，聚焦「無人化科技」五大次領域，透過「全球新創—科技—資本—市場—台灣供應鏈」五層新創情報，分析資本熱點與台灣供應鏈優勢的靜態網站。

## 五大次領域
1. 多旋翼與固定翼無人機技術
2. 電子戰與彈道防禦自主化技術
3. 深海自主探測與聲學成像設備
4. 軌道通信與中小型火箭發射技術
5. 高精度衛星定位與導航技術

## 檔案結構
```
index.html          頁面結構
assets/styles.css   樣式（含深色模式）
assets/app.js       圖表與互動（原生 SVG，無外部函式庫）
assets/data.js      全站資料來源
```

## 使用方式
直接以瀏覽器開啟 `index.html`，或部署至 GitHub Pages（Settings → Pages → Deploy from branch）。

## 更新數據
目前 `assets/data.js` 中的家數、金額、成長率、輪次與投資人為**示意資料**。
請以 Signal Atlas 正式輸出替換後，將 `meta.illustrative` 改為 `false`，頁面上的示意提示即會移除。
