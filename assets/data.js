/*
 * 報告資料檔
 * ------------------------------------------------------------------
 * 網站所有圖表、表格與文字卡片都由此檔驅動。
 * 目前數值為「示意資料」(placeholder)，用以呈現版面與分析架構；
 * 請以 SParta+ 模型正式輸出結果替換對應欄位後即可更新全站。
 * 若完成替換，請將 meta.illustrative 改為 false 以移除頁面上的示意標示。
 */
window.REPORT = {
  meta: {
    illustrative: true,
    title: "無人化科技 新創情報探勘報告",
    model: "SParta+",
    totalStartups: 76898,
    themeStartups: 2406,
    period: "2021 – 2026 Q2",
    currency: "USD"
  },

  /* 五層新創情報架構 */
  layers: [
    { key: "startup", name: "全球新創", en: "Startups", desc: "以 SParta+ 解構新創公司非結構化描述，判定是否屬於無人化科技及其次領域。", q: "誰在做？" },
    { key: "tech", name: "科技", en: "Technology", desc: "萃取關鍵技術詞與產品型態，建立技術標籤與技術成熟度輪廓。", q: "做什麼？" },
    { key: "capital", name: "資本", en: "Capital", desc: "串接募資輪次、金額與投資人，辨識資本流向與熱點賽道。", q: "誰在投？" },
    { key: "market", name: "市場", en: "Market", desc: "以國家／區域與應用場景（國防、商用、科研）描繪市場需求。", q: "賣給誰？" },
    { key: "taiwan", name: "台灣供應鏈", en: "Taiwan Supply Chain", desc: "將技術節點對標台灣上市櫃與研究機構能量，找出可切入環節。", q: "台灣在哪？" }
  ],

  /* 五個次領域 */
  domains: [
    {
      id: "uav",
      name: "多旋翼與固定翼無人機技術",
      short: "無人機",
      startups: 1124,
      fundingB: 14.8,
      growth: 38,
      summary: "數量最多、資本最集中的次領域。烏克蘭戰場與國防採購帶動「可量產、低成本、具自主飛控」的無人機需求，資本從消費級轉向國防與工業巡檢。",
      techs: ["自主飛控與群飛 (Swarm)", "視覺導航 (GNSS-denied)", "垂直起降固定翼 (VTOL)", "長航時動力／氫燃料", "邊緣 AI 目標辨識", "抗干擾資料鏈"],
      countries: [
        { c: "美國", n: 412 }, { c: "中國", n: 168 }, { c: "英國", n: 74 }, { c: "德國", n: 61 },
        { c: "以色列", n: 55 }, { c: "烏克蘭", n: 52 }, { c: "印度", n: 49 }, { c: "法國", n: 38 }
      ],
      examples: [
        { name: "Shield AI", country: "美國", note: "Hivemind 自主飛行 AI、V-BAT 垂直起降無人機" },
        { name: "Skydio", country: "美國", note: "自主避障無人機，轉向國防與公共安全" },
        { name: "Quantum-Systems", country: "德國", note: "eVTOL 固定翼偵察無人機" },
        { name: "Tekever", country: "葡萄牙", note: "長航時固定翼 ISR 無人機" }
      ],
      taiwan: [
        { seg: "整機／系統整合", firms: "雷虎科技、中光電、經緯航太、漢翔", level: 2 },
        { seg: "飛控／通訊模組", firms: "啟碁、正文、神準", level: 2 },
        { seg: "馬達與動力系統", firms: "東元、台達電、大銀微系統", level: 3 },
        { seg: "電池與能源", firms: "順達、新普、加百裕", level: 3 },
        { seg: "光學／影像感測", firms: "亞光、大立光、晶睿", level: 3 },
        { seg: "AI 運算晶片", firms: "聯發科、瑞昱、凌華", level: 2 }
      ]
    },
    {
      id: "ew",
      name: "電子戰與彈道防禦自主化技術",
      short: "電子戰／防禦",
      startups: 318,
      fundingB: 9.6,
      growth: 54,
      summary: "家數少但單筆金額大、成長最快。反無人機 (C-UAS)、高功率微波與 AI 感測融合成為焦點，投資人以國防專業基金與主權資本為主。",
      techs: ["反無人機 C-UAS", "高功率微波 (HPM)", "被動射頻偵測", "AI 感測融合與指管", "軟體定義無線電 (SDR)", "攔截彈自主導引"],
      countries: [
        { c: "美國", n: 141 }, { c: "以色列", n: 46 }, { c: "英國", n: 28 }, { c: "德國", n: 22 },
        { c: "烏克蘭", n: 19 }, { c: "法國", n: 14 }, { c: "南韓", n: 11 }, { c: "澳洲", n: 9 }
      ],
      examples: [
        { name: "Anduril", country: "美國", note: "Lattice 指管平台、反無人機與自主攔截系統" },
        { name: "Epirus", country: "美國", note: "Leonidas 固態高功率微波反無人機" },
        { name: "Helsing", country: "德國", note: "國防 AI 感測融合與電子戰軟體" },
        { name: "CHAOS Industries", country: "美國", note: "新世代雷達與感測網路" }
      ],
      taiwan: [
        { seg: "化合物半導體 (GaN/GaAs)", firms: "穩懋、宏捷科、全訊", level: 3 },
        { seg: "射頻前端與天線", firms: "昇達科、耀登、台揚", level: 3 },
        { seg: "雷達／電子戰系統", firms: "中科院、雷虎", level: 2 },
        { seg: "高可靠度 PCB／載板", firms: "華通、欣興、臻鼎", level: 3 },
        { seg: "指管軟體與資料融合", firms: "研究機構為主", level: 1 }
      ]
    },
    {
      id: "ocean",
      name: "深海自主探測與聲學成像設備",
      short: "深海探測",
      startups: 207,
      fundingB: 2.9,
      growth: 31,
      summary: "海底電纜防護、離岸風電維運與水下國防需求推升關注。自主水下載具 (AUV)、無人水面艇 (USV) 與合成孔徑聲納是主要賽道，仍以早期輪次為主。",
      techs: ["自主水下載具 AUV", "無人水面艇 USV", "合成孔徑聲納 SAS", "水下聲學通訊", "海底管線／電纜巡檢", "長航時水下能源"],
      countries: [
        { c: "美國", n: 64 }, { c: "英國", n: 27 }, { c: "挪威", n: 21 }, { c: "法國", n: 15 },
        { c: "澳洲", n: 13 }, { c: "中國", n: 12 }, { c: "加拿大", n: 11 }, { c: "日本", n: 8 }
      ],
      examples: [
        { name: "Saildrone", country: "美國", note: "風帆動力無人水面艇與海洋資料服務" },
        { name: "HavocAI", country: "美國", note: "自主化無人水面艇群" },
        { name: "Terradepth", country: "美國", note: "自主海底測繪與資料平台" },
        { name: "Ocean Infinity", country: "英國", note: "機器人船隊與深海探測服務" }
      ],
      taiwan: [
        { seg: "船體與載具製造", firms: "台船、龍德造船", level: 2 },
        { seg: "聲學／壓電元件", firms: "研究機構與中小企業", level: 1 },
        { seg: "水密連接器與線纜", firms: "貿聯、嘉澤", level: 2 },
        { seg: "電力電子與電池", firms: "台達電、新普", level: 3 },
        { seg: "海洋科研能量", firms: "國家海洋研究院、中山大學", level: 2 }
      ]
    },
    {
      id: "space",
      name: "軌道通信與中小型火箭發射技術",
      short: "軌道通信／發射",
      startups: 486,
      fundingB: 18.2,
      growth: 27,
      summary: "總募資金額最高。低軌衛星直連手機 (D2D) 與小型發射服務吸引大額後期輪，美中雙極明顯，歐洲以主權發射能力為訴求加速追趕。",
      techs: ["低軌衛星直連手機 D2D", "相位陣列天線", "衛星光通訊", "可重複使用小型火箭", "3D 列印引擎", "在軌服務與機動"],
      countries: [
        { c: "美國", n: 171 }, { c: "中國", n: 72 }, { c: "英國", n: 38 }, { c: "德國", n: 27 },
        { c: "印度", n: 31 }, { c: "法國", n: 22 }, { c: "日本", n: 21 }, { c: "澳洲", n: 14 }
      ],
      examples: [
        { name: "Stoke Space", country: "美國", note: "全可重複使用中型火箭" },
        { name: "Isar Aerospace", country: "德國", note: "Spectrum 小型運載火箭" },
        { name: "Lynk Global", country: "美國", note: "衛星直連一般手機服務" },
        { name: "Astranis", country: "美國", note: "小型地球同步通訊衛星" }
      ],
      taiwan: [
        { seg: "衛星地面設備／天線", firms: "昇達科、耀登、啟碁、台揚", level: 3 },
        { seg: "衛星用 PCB 與零組件", firms: "華通、同欣電、穩懋", level: 3 },
        { seg: "衛星本體與酬載", firms: "國家太空中心、創未來", level: 2 },
        { seg: "火箭發射", firms: "晉陞太空、國家太空中心", level: 1 },
        { seg: "精密機構與材料", firms: "晟田、拓凱", level: 2 }
      ]
    },
    {
      id: "gnss",
      name: "高精度衛星定位與導航技術",
      short: "定位導航",
      startups: 271,
      fundingB: 3.4,
      growth: 46,
      summary: "GNSS 干擾與欺騙事件頻傳，使「抗干擾、替代導航 (Alt-PNT)」成為新興熱點。低軌導航星座、量子／視覺慣性導航獲國防與自駕需求雙重拉動。",
      techs: ["RTK / PPP 高精度定位", "低軌導航星座 LEO-PNT", "抗干擾／抗欺騙", "視覺慣性導航 VIO", "量子慣性感測", "地磁／地形匹配導航"],
      countries: [
        { c: "美國", n: 96 }, { c: "英國", n: 24 }, { c: "中國", n: 33 }, { c: "法國", n: 17 },
        { c: "德國", n: 16 }, { c: "以色列", n: 14 }, { c: "日本", n: 12 }, { c: "瑞士", n: 9 }
      ],
      examples: [
        { name: "Xona Space Systems", country: "美國", note: "低軌高精度導航星座 Pulsar" },
        { name: "Swift Navigation", country: "美國", note: "Skylark 精密定位服務" },
        { name: "Point One Navigation", country: "美國", note: "公分級定位平台" },
        { name: "TrustPoint", country: "美國", note: "抗干擾 LEO 導航訊號" }
      ],
      taiwan: [
        { seg: "GNSS 晶片", firms: "聯發科、瑞昱", level: 3 },
        { seg: "定位模組與終端", firms: "環天、佳世達、台灣國際航電", level: 3 },
        { seg: "慣性感測 (IMU/MEMS)", firms: "研究機構與中小企業", level: 1 },
        { seg: "高精度天線", firms: "耀登、佳邦", level: 2 },
        { seg: "定位演算法與服務", firms: "工研院、新創團隊", level: 1 }
      ]
    }
  ],

  /* 募資輪次分布（家數）— 依次領域 */
  rounds: {
    labels: ["種子／天使", "A 輪", "B 輪", "C 輪", "D 輪以上", "策略／其他"],
    byDomain: {
      uav:   [402, 298, 176, 98, 57, 93],
      ew:    [84, 86, 62, 39, 26, 21],
      ocean: [88, 58, 29, 12, 5, 15],
      space: [138, 122, 89, 58, 41, 38],
      gnss:  [104, 77, 45, 21, 9, 15]
    }
  },

  /* 主要投資人（示意） */
  investors: [
    { name: "Founders Fund", type: "創投", domains: ["uav", "ew", "space"], deals: 31 },
    { name: "Andreessen Horowitz (a16z)", type: "創投", domains: ["uav", "ew", "gnss"], deals: 27 },
    { name: "General Catalyst", type: "創投", domains: ["ew", "uav"], deals: 22 },
    { name: "Lux Capital", type: "創投", domains: ["ew", "ocean", "space"], deals: 19 },
    { name: "In-Q-Tel", type: "政府策略", domains: ["ew", "gnss", "ocean", "space"], deals: 24 },
    { name: "NATO Innovation Fund", type: "主權／多邊", domains: ["ew", "uav", "ocean"], deals: 12 },
    { name: "8VC", type: "創投", domains: ["uav", "ew"], deals: 14 },
    { name: "Seraphim Space", type: "太空專業", domains: ["space", "gnss"], deals: 21 }
  ],

  /* 關鍵問題與結論 */
  answers: [
    {
      q: "哪些國家正在形成資本熱點？",
      a: "美國在五個次領域皆居首，約占家數四成、金額過半；以色列與英國在電子戰、德國在無人機與發射、挪威在深海形成區域性聚落；烏克蘭以戰場驗證帶動無人機與電子戰新創快速增生。"
    },
    {
      q: "哪些賽道正在升溫？",
      a: "電子戰／彈道防禦自主化 (成長 54%) 與定位導航中的抗干擾 Alt-PNT (成長 46%) 增速最快；軌道通信／發射則是金額規模最大的成熟賽道。"
    },
    {
      q: "哪些輪次與投資人最活躍？",
      a: "種子至 A 輪仍占六成，但電子戰與太空的 C 輪以上比例明顯偏高，顯示資本向已取得國防合約者集中。國防專業創投、政府策略基金 (如 In-Q-Tel) 與多邊基金成為主力。"
    },
    {
      q: "台灣在哪些環節具優勢？",
      a: "台灣優勢集中在「硬體零組件層」：化合物半導體、射頻前端與天線、衛星級 PCB、電池與馬達、GNSS 晶片與模組。相對弱項在系統整合、指管軟體、聲學元件與慣性感測，適合以國際新創合作補位。"
    }
  ],

  /* 接上 Gate-to-Market：每個次領域由 SParta+ 情報推導的候選情境（示意，全部為 C 級專家／AI 假設，
     須經技術方校準與段 2 外部證據驗證，才能成為承重結論）。 */
  gtm: {
    uav: [
      { s: "電網與電塔自主巡檢", icp: "電力公司巡檢部門", trigger: "人力不足、颱風後需快速盤點設備", tech: "自主飛控、邊緣 AI 辨識", next: "訪談 2 家電力公司巡檢主管" },
      { s: "非紅供應鏈無人機零組件套件", icp: "歐美無人機整機新創", trigger: "國防採購排除特定來源零件", tech: "馬達、電池、飛控模組", next: "向 3 家整機新創詢價與送樣" },
      { s: "港口與海岸長航時監視", icp: "海巡與港務單位", trigger: "監視範圍擴大、人力成本上升", tech: "VTOL、長航時動力", next: "取得一次場域試飛機會" }
    ],
    ew: [
      { s: "機場與關鍵設施反無人機偵測", icp: "機場管理單位、科學園區保全", trigger: "無人機闖入造成停飛或停工", tech: "被動射頻偵測、感測融合", next: "訪談 2 個機場的安全主管" },
      { s: "GaN 射頻前端供應電子戰新創", icp: "美國、以色列電子戰新創", trigger: "高功率與小型化需求", tech: "GaN／GaAs 射頻元件", next: "向 3 家新創提供規格書並詢問評估流程" },
      { s: "軟體定義無線電模組", icp: "國防系統整合商", trigger: "多頻段、快速改版需求", tech: "SDR、射頻前端", next: "與 1 家整合商做需求訪談" }
    ],
    ocean: [
      { s: "海底電纜巡檢 AUV 服務", icp: "電信與海纜營運商", trigger: "海纜斷線事件頻傳", tech: "AUV、合成孔徑聲納", next: "訪談海纜維運負責人" },
      { s: "離岸風電基礎聲學檢測", icp: "離岸風場營運商", trigger: "定期維運檢查要求", tech: "聲學成像、USV", next: "取得檢測規範與現行報價" },
      { s: "水下載具電池與水密連接器", icp: "AUV／USV 新創", trigger: "長航時與可靠度需求", tech: "電池、水密連接器", next: "向 2 家新創送樣測試" }
    ],
    space: [
      { s: "低軌衛星地面終端天線", icp: "低軌衛星營運商", trigger: "星座擴張帶動終端需求", tech: "相位陣列天線、射頻模組", next: "確認 1 家營運商的供應商資格流程" },
      { s: "衛星級 PCB 與射頻零組件", icp: "衛星製造新創", trigger: "量產與成本壓力", tech: "高可靠度 PCB、化合物半導體", next: "詢問 3 家新創的認證門檻" },
      { s: "手機直連衛星（D2D）測試服務", icp: "電信業者", trigger: "D2D 商轉前驗證需求", tech: "射頻量測、天線", next: "訪談電信業者網路規劃部門" }
    ],
    gnss: [
      { s: "抗干擾定位模組", icp: "無人機與自駕車業者", trigger: "GNSS 干擾與欺騙事件", tech: "多頻 GNSS、抗干擾天線", next: "訪談 3 家無人機業者的導航負責人" },
      { s: "公分級定位與 RTK 服務", icp: "農業機械、測繪業者", trigger: "自動化作業需要高精度", tech: "RTK／PPP、定位模組", next: "取得 1 家農機業者試用" },
      { s: "港區替代導航（Alt-PNT）", icp: "港務與自動化碼頭", trigger: "GNSS 遮蔽與干擾", tech: "視覺慣性導航、地面信標", next: "訪談自動化碼頭營運方" }
    ]
  },

  recommendations: [
    { t: "以非紅供應鏈切入國際無人機訂單", d: "鎖定美、歐、烏無人機新創對可信賴零組件的需求，推動馬達、電池、影像與飛控模組的國產化套件。" },
    { t: "從 GaN 射頻延伸至電子戰次系統", d: "結合化合物半導體與射頻模組優勢，往反無人機偵測與干擾次系統發展，對接以色列、美國電子戰新創。" },
    { t: "把握低軌衛星地面段與酬載零組件", d: "延續衛星 PCB、天線與地面終端出貨經驗，爭取直連手機 (D2D) 與光通訊新星座的供應資格。" },
    { t: "補強深海與慣性導航等弱項", d: "以研究機構技術轉移與國際新創投資／共同開發，補足聲學成像、IMU 與替代導航演算法能量。" }
  ]
};
