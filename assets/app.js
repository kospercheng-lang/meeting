(function () {
  "use strict";
  var R = window.REPORT;
  var SVGNS = "http://www.w3.org/2000/svg";
  var SERIES = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--s5)"];
  var LEVEL = {
    3: { cls: "lv3", icon: "▲", text: "優勢" },
    2: { cls: "lv2", icon: "●", text: "具基礎" },
    1: { cls: "lv1", icon: "▽", text: "待補強" }
  };
  var fmt = function (n) { return n.toLocaleString("zh-TW"); };
  var $ = function (id) { return document.getElementById(id); };
  var domainColor = {};
  R.domains.forEach(function (d, i) { domainColor[d.id] = SERIES[i]; });

  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Tooltip ---------- */
  var tip = $("tooltip");
  function showTip(html, evt) {
    tip.innerHTML = html;
    tip.classList.add("show");
    moveTip(evt);
  }
  function moveTip(evt) {
    var x = evt.clientX + 14, y = evt.clientY + 14;
    var r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - 14;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function hideTip() { tip.classList.remove("show"); }
  function bindTip(node, html, group) {
    node.addEventListener("mouseenter", function (e) {
      showTip(html, e);
      if (group) group.forEach(function (m, i) { m.classList.toggle("dim", m !== node.__mark); });
    });
    node.addEventListener("mousemove", moveTip);
    node.addEventListener("mouseleave", function () {
      hideTip();
      if (group) group.forEach(function (m) { m.classList.remove("dim"); });
    });
  }

  /* ---------- Theme ---------- */
  (function theme() {
    var root = document.documentElement;
    try { var saved = localStorage.getItem("theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
    $("themeToggle").addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      if (!cur) cur = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  })();

  /* ---------- Hero ---------- */
  function renderHero() {
    $("heroTotal").textContent = fmt(R.meta.totalStartups);
    $("illustrativeNotice").hidden = !R.meta.illustrative;
    $("footPeriod").textContent = R.meta.period;
    var totalFunding = R.domains.reduce(function (s, d) { return s + d.fundingB; }, 0);
    var kpis = [
      { v: fmt(R.meta.totalStartups), l: "Signal Atlas 掃描新創家數" },
      { v: fmt(R.meta.themeStartups), l: "無人化科技相關新創" },
      { v: "5", l: "聚焦次領域" },
      { v: "US$" + totalFunding.toFixed(1) + "B", l: "次領域累計募資" },
      { v: "5 層", l: "新創情報分析架構" }
    ];
    var box = $("kpis");
    kpis.forEach(function (k) {
      box.appendChild(h("div", "kpi", '<div class="v">' + k.v + '</div><div class="l">' + k.l + "</div>"));
    });
  }

  /* ---------- Method ---------- */
  function renderMethod() {
    var steps = [
      { n: R.meta.totalStartups, l: "全球新創公司（非結構化文字描述）" },
      { n: R.meta.themeStartups, l: "Signal Atlas 判定為無人化科技相關" },
      { n: null, l: "歸入 5 個次領域，展開五層情報並對標台灣供應鏈" }
    ];
    var f = $("funnel");
    var max = steps[0].n;
    steps.forEach(function (s, i) {
      var row = h("div", "funnel-row");
      var w = s.n ? Math.max(14, Math.sqrt(s.n / max) * 100) : 10;
      var bar = h("div", "funnel-bar", s.n ? fmt(s.n) : "5 次領域");
      bar.style.width = "calc(" + w + "% - 0px)";
      bar.style.maxWidth = "62%";
      bar.style.opacity = String(1 - i * 0.18);
      row.appendChild(bar);
      row.appendChild(h("div", "funnel-label", s.l));
      f.appendChild(row);
    });
    var ol = $("layers");
    R.layers.forEach(function (L, i) {
      ol.appendChild(h("li", null,
        '<div class="n">LAYER ' + (i + 1) + "</div><h3>" + L.name + '</h3><div class="en">' + L.en +
        "</div><p>" + L.desc + '</p><span class="q">' + L.q + "</span>"));
    });
  }

  /* ---------- Horizontal bar chart ---------- */
  function hbar(container, rows, opts) {
    var W = 420, rowH = 34, padL = 104, padR = 52, padT = 4, padB = 24;
    var H = padT + rows.length * rowH + padB;
    var max = opts.max || Math.max.apply(null, rows.map(function (r) { return r.v; }));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": opts.label });
    var x = function (v) { return padL + (v / max) * (W - padL - padR); };
    var ticks = opts.ticks || 4;
    for (var t = 0; t <= ticks; t++) {
      var tv = (max / ticks) * t, tx = x(tv);
      el("line", { x1: tx, x2: tx, y1: padT, y2: H - padB, class: t === 0 ? "baseline" : "gridline" }, svg);
      var tl = el("text", { x: tx, y: H - 6, "text-anchor": "middle", class: "axis-text" }, svg);
      tl.textContent = opts.tickFmt ? opts.tickFmt(tv) : Math.round(tv);
    }
    var marks = [];
    rows.forEach(function (r, i) {
      var y = padT + i * rowH + 8, bh = rowH - 16;
      var lab = el("text", { x: padL - 10, y: y + bh / 2 + 4, "text-anchor": "end", class: "label-text" }, svg);
      lab.textContent = r.label;
      var w = Math.max(2, x(r.v) - padL);
      var rx = Math.min(4, w / 2);
      var path = "M" + padL + "," + y + "h" + (w - rx) + "a" + rx + "," + rx + " 0 0 1 " + rx + "," + rx +
        "v" + (bh - 2 * rx) + "a" + rx + "," + rx + " 0 0 1 -" + rx + "," + rx + "h-" + (w - rx) + "z";
      var m = el("path", { d: path, class: "mark", style: "fill:" + (r.color || "var(--s1)") }, svg);
      marks.push(m);
      var vt = el("text", { x: padL + w + 6, y: y + bh / 2 + 4, class: "value-text" }, svg);
      vt.textContent = opts.valFmt ? opts.valFmt(r.v) : fmt(r.v);
      var hit = el("rect", { x: 0, y: padT + i * rowH, width: W, height: rowH, class: "hit" }, svg);
      hit.__mark = m;
      r._hit = hit;
    });
    rows.forEach(function (r) { bindTip(r._hit, r.tip, marks); });
    container.innerHTML = "";
    container.appendChild(svg);
  }

  /* ---------- Overview ---------- */
  function renderOverview() {
    var mk = function (key, fmtV, unit) {
      return R.domains.map(function (d) {
        return {
          label: d.short, v: d[key], color: domainColor[d.id],
          tip: "<b>" + esc(d.name) + "</b>" + fmtV(d[key]) + unit
        };
      });
    };
    hbar($("chartCount"), mk("startups", fmt, " 家"), { label: "各次領域新創家數", ticks: 4 });
    hbar($("chartFunding"), mk("fundingB", function (v) { return "US$" + v.toFixed(1); }, " B"),
      { label: "各次領域累計募資金額", max: 20, ticks: 4, valFmt: function (v) { return v.toFixed(1); } });
    hbar($("chartGrowth"), mk("growth", String, "%"),
      { label: "各次領域成長率", max: 60, ticks: 3, valFmt: function (v) { return v + "%"; }, tickFmt: function (v) { return v + "%"; } });
  }

  /* ---------- Heatmap ---------- */
  var SEQ = ["#cde2fb", "#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"];
  function renderHeatmap() {
    var totals = {};
    R.domains.forEach(function (d) {
      d.countries.forEach(function (c) { totals[c.c] = (totals[c.c] || 0) + c.n; });
    });
    var countries = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; }).slice(0, 12);
    var lookup = {};
    R.domains.forEach(function (d) { d.countries.forEach(function (c) { lookup[d.id + "|" + c.c] = c.n; }); });
    var max = 0;
    for (var k in lookup) max = Math.max(max, lookup[k]);

    var cellW = 54, cellH = 40, padL = 132, padT = 30, gap = 2;
    var W = padL + countries.length * cellW + 60, H = padT + R.domains.length * cellH + 4;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "國家與次領域新創家數熱力圖" });
    countries.forEach(function (c, j) {
      var t = el("text", { x: padL + j * cellW + cellW / 2, y: 18, "text-anchor": "middle", class: "label-text" }, svg);
      t.textContent = c;
    });
    var tt = el("text", { x: padL + countries.length * cellW + 30, y: 18, "text-anchor": "middle", class: "axis-text" }, svg);
    tt.textContent = "合計";
    R.domains.forEach(function (d, i) {
      var y = padT + i * cellH;
      var lt = el("text", { x: padL - 10, y: y + cellH / 2 + 4, "text-anchor": "end", class: "label-text" }, svg);
      lt.textContent = d.short;
      var rowSum = 0;
      countries.forEach(function (c, j) {
        var v = lookup[d.id + "|" + c] || 0;
        rowSum += v;
        var x = padL + j * cellW;
        var idx = v ? Math.min(SEQ.length - 1, Math.round(Math.sqrt(v / max) * (SEQ.length - 1))) : -1;
        var fill = idx < 0 ? "var(--surface-2)" : SEQ[idx];
        var r = el("rect", { x: x + gap / 2, y: y + gap / 2, width: cellW - gap, height: cellH - gap, rx: 4, style: "fill:" + fill }, svg);
        var txt = el("text", { x: x + cellW / 2, y: y + cellH / 2 + 4, "text-anchor": "middle", class: "heat-cell-text",
          style: "fill:" + (idx >= 6 ? "#ffffff" : idx < 0 ? "var(--muted)" : "#0b0b0b") }, svg);
        txt.textContent = v ? v : "–";
        bindTip(r, "<b>" + esc(c) + " · " + esc(d.short) + "</b>" + (v ? fmt(v) + " 家新創" : "未列入前八大國家"));
      });
      var st = el("text", { x: padL + countries.length * cellW + 30, y: y + cellH / 2 + 4, "text-anchor": "middle", class: "value-text" }, svg);
      st.textContent = fmt(rowSum);
    });
    $("heatmap").appendChild(svg);
    $("heatLegend").innerHTML = "少 <span class='ramp' style='background:linear-gradient(90deg," + SEQ.join(",") + ")'></span> 多 <span style='margin-left:12px'>「–」表示該國未列入此次領域前八大</span>";
  }

  /* ---------- Rounds (100% stacked) ---------- */
  var ROUND_COLORS = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#0d366b", "#a8a69d"];
  function renderRounds() {
    var labels = R.rounds.labels;
    $("roundLegend").innerHTML = labels.map(function (l, i) {
      return "<span><i style='background:" + ROUND_COLORS[i] + "'></i>" + l + "</span>";
    }).join("");
    var W = 1000, rowH = 44, padL = 104, padR = 8, padT = 4, padB = 22;
    var H = padT + R.domains.length * rowH + padB;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "各次領域募資輪次結構" });
    var iw = W - padL - padR;
    [0, 25, 50, 75, 100].forEach(function (p) {
      var x = padL + iw * p / 100;
      el("line", { x1: x, x2: x, y1: padT, y2: H - padB, class: p === 0 ? "baseline" : "gridline" }, svg);
      var t = el("text", { x: x, y: H - 6, "text-anchor": "middle", class: "axis-text" }, svg);
      t.textContent = p + "%";
    });
    R.domains.forEach(function (d, i) {
      var vals = R.rounds.byDomain[d.id];
      var sum = vals.reduce(function (a, b) { return a + b; }, 0);
      var y = padT + i * rowH + 10, bh = rowH - 20;
      var lt = el("text", { x: padL - 10, y: y + bh / 2 + 4, "text-anchor": "end", class: "label-text" }, svg);
      lt.textContent = d.short;
      var x = padL;
      vals.forEach(function (v, j) {
        var w = iw * v / sum;
        var r = el("rect", { x: x + (j ? 1 : 0), y: y, width: Math.max(0, w - (j ? 2 : 1)), height: bh, rx: 2, style: "fill:" + ROUND_COLORS[j] }, svg);
        var pct = Math.round(v / sum * 100);
        if (w > 34) {
          var t = el("text", { x: x + w / 2, y: y + bh / 2 + 4, "text-anchor": "middle", class: "heat-cell-text", style: "fill:" + (j >= 2 && j <= 4 ? "#fff" : "#0b0b0b") }, svg);
          t.textContent = pct + "%";
        }
        bindTip(r, "<b>" + esc(d.short) + " · " + labels[j] + "</b>" + fmt(v) + " 家（" + pct + "%）");
        x += w;
      });
    });
    $("rounds").appendChild(svg);

    var html = "<div class='table-wrap'><table><thead><tr><th>次領域</th>" +
      labels.map(function (l) { return "<th class='num'>" + l + "</th>"; }).join("") + "<th class='num'>合計</th></tr></thead><tbody>";
    R.domains.forEach(function (d) {
      var vals = R.rounds.byDomain[d.id];
      html += "<tr><td>" + d.short + "</td>" + vals.map(function (v) { return "<td class='num'>" + fmt(v) + "</td>"; }).join("") +
        "<td class='num'>" + fmt(vals.reduce(function (a, b) { return a + b; }, 0)) + "</td></tr>";
    });
    $("roundsTable").innerHTML = html + "</tbody></table></div>";
  }

  /* ---------- Investors ---------- */
  function renderInvestors() {
    var list = R.investors.slice().sort(function (a, b) { return b.deals - a.deals; });
    var max = list[0].deals;
    var byId = {};
    R.domains.forEach(function (d) { byId[d.id] = d; });
    var html = "<table><thead><tr><th>投資人</th><th>類型</th><th>主要布局次領域</th><th class='num'>交易筆數</th></tr></thead><tbody>";
    list.forEach(function (v) {
      html += "<tr><td><b>" + esc(v.name) + "</b></td><td>" + esc(v.type) + "</td><td>" +
        v.domains.map(function (id) { return "<span class='chip'><i style='background:" + domainColor[id] + "'></i>" + byId[id].short + "</span>"; }).join("") +
        "</td><td class='num' style='white-space:nowrap'><span class='bar-inline' style='width:" + Math.round(v.deals / max * 80) + "px'></span>" + v.deals + "</td></tr>";
    });
    $("investors").innerHTML = html + "</tbody></table>";
  }

  /* ---------- Domain tabs ---------- */
  function renderDomain(d) {
    var p = $("domainPanel");
    p.innerHTML = "";
    var head = h("div", "domain-head");
    head.appendChild(h("div", null, "<h3>" + esc(d.name) + "</h3><p>" + esc(d.summary) + "</p>"));
    head.appendChild(h("div", "mini-kpis",
      "<div><div class='v'>" + fmt(d.startups) + "</div><div class='l'>新創家數</div></div>" +
      "<div><div class='v'>$" + d.fundingB.toFixed(1) + "B</div><div class='l'>累計募資</div></div>" +
      "<div><div class='v'>+" + d.growth + "%</div><div class='l'>年成長率</div></div>"));
    p.appendChild(head);

    var grid = h("div", "domain-grid");
    var c1 = h("figure", "card");
    c1.appendChild(h("figcaption", null, "國家分布<small>前八大，家數</small>"));
    var ch = h("div", "chart");
    c1.appendChild(ch);
    grid.appendChild(c1);

    var c2 = h("div", "card");
    c2.appendChild(h("figcaption", null, "關鍵技術焦點"));
    c2.appendChild(h("div", "tech-list", d.techs.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("")));
    c2.appendChild(h("figcaption", null, "<span style='display:block;margin-top:20px'>代表性新創</span>"));
    d.examples.forEach(function (e) {
      c2.appendChild(h("div", "example", "<b>" + esc(e.name) + "</b><small>" + esc(e.country) + "</small><p>" + esc(e.note) + "</p>"));
    });
    grid.appendChild(c2);

    var c3 = h("div", "card");
    c3.appendChild(h("figcaption", null, "對標台灣供應鏈"));
    c3.appendChild(twRows(d));
    grid.appendChild(c3);
    p.appendChild(grid);

    var rows = d.countries.slice().sort(function (a, b) { return b.n - a.n; }).map(function (c) {
      return { label: c.c, v: c.n, color: domainColor[d.id], tip: "<b>" + esc(c.c) + "</b>" + fmt(c.n) + " 家新創" };
    });
    hbar(ch, rows, { label: d.short + " 國家分布", ticks: 4 });
  }
  function twRows(d) {
    var box = h("div");
    d.taiwan.slice().sort(function (a, b) { return b.level - a.level; }).forEach(function (t) {
      var L = LEVEL[t.level];
      box.appendChild(h("div", "tw-row",
        "<span class='lv " + L.cls + "'><i>" + L.icon + "</i>" + L.text + "</span>" +
        "<span class='seg'>" + esc(t.seg) + "</span><span class='firms'>" + esc(t.firms) + "</span>"));
    });
    return box;
  }
  function renderTabs() {
    var tabs = $("domainTabs");
    var btns = [];
    R.domains.forEach(function (d, i) {
      var b = h("button", "tab", "<i style='background:" + domainColor[d.id] + "'></i>" + esc(d.name));
      b.type = "button";
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () { select(i); });
      btns.push(b);
      tabs.appendChild(b);
    });
    function select(i) {
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", String(i === j)); });
      renderDomain(R.domains[i]);
    }
    select(0);
  }

  /* ---------- Taiwan matrix ---------- */
  function renderTaiwan() {
    var g = $("twMatrix");
    R.domains.slice().map(function (d) {
      var score = d.taiwan.reduce(function (s, t) { return s + t.level; }, 0) / d.taiwan.length;
      return { d: d, score: score };
    }).sort(function (a, b) { return b.score - a.score; }).forEach(function (o) {
      var d = o.d;
      var strong = d.taiwan.filter(function (t) { return t.level === 3; }).length;
      var col = h("div", "tw-col");
      col.appendChild(h("h3", null, "<i style='background:" + domainColor[d.id] + "'></i>" + esc(d.name)));
      col.appendChild(h("div", "tw-score", "優勢環節 " + strong + " / " + d.taiwan.length + "　·　平均成熟度 " + o.score.toFixed(1) + " / 3"));
      col.appendChild(twRows(d));
      g.appendChild(col);
    });
  }

  /* ---------- Insights ---------- */
  function renderInsights() {
    $("answers").innerHTML = R.answers.map(function (a) {
      return "<div class='answer'><h3>" + esc(a.q) + "</h3><p>" + esc(a.a) + "</p></div>";
    }).join("");
    $("recs").innerHTML = R.recommendations.map(function (r) {
      return "<div class='rec'><div><h4>" + esc(r.t) + "</h4><p>" + esc(r.d) + "</p></div></div>";
    }).join("");
  }


  /* ---------- GTM bridge ---------- */
  function renderGtm() {
    if (!R.gtm) return;
    var tabs = $("gtmTabs"), btns = [];
    R.domains.forEach(function (d, i) {
      var b = h("button", "tab", "<i style='background:" + domainColor[d.id] + "'></i>" + esc(d.short));
      b.type = "button"; b.setAttribute("role", "tab");
      b.addEventListener("click", function () { pick(i); });
      btns.push(b); tabs.appendChild(b);
    });
    function pick(i) {
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", String(i === j)); });
      draw(R.domains[i]);
    }
    function draw(d) {
      var p = $("gtmPanel"); p.innerHTML = "";
      var rows = R.gtm[d.id] || [];
      var top = d.countries.slice().sort(function (a, b) { return b.n - a.n; })[0].c;
      var t = "<table><thead><tr><th>候選情境</th><th>ICP</th><th>觸發情境</th><th>技術依據</th><th>證據</th><th>下一個最便宜驗證</th></tr></thead><tbody>";
      rows.forEach(function (r) {
        t += "<tr><td><b>" + esc(r.s) + "</b></td><td>" + esc(r.icp) + "</td><td>" + esc(r.trigger) + "</td><td>" + esc(r.tech) +
          "</td><td><span class='grade-c'>C 級假設</span></td><td>" + esc(r.next) + "</td></tr>";
      });
      t += "</tbody></table>";
      var c1 = h("div", "card");
      c1.innerHTML = "<figcaption>段 1｜候選情境池草稿<small>" + esc(d.name) + "，共 " + rows.length + " 個</small></figcaption><div class='table-wrap'>" + t + "</div>";
      var row = h("div", "copy-row");
      var msg = h("span", "copy-msg", "複製後，在案件工作台的「市場機會單元」按「從 Signal Atlas 匯入」貼上。");
      msg.setAttribute("aria-live", "polite");
      var btn = h("button", "copy-btn", "複製為工作台匯入資料");
      btn.type = "button";
      var payload = JSON.stringify({ source: "Signal Atlas", domain: d.name, cells: rows.map(function (r) {
        return { product: r.s, region: top, icp: r.icp, jtbd: r.trigger, advantage: r.tech, grade: "C 專家假設", next: r.next };
      }) });
      btn.addEventListener("click", function () {
        function fallback() {
          var ta = c1.querySelector(".copy-area") || c1.appendChild(h("textarea", "copy-area"));
          ta.value = payload; ta.setAttribute("aria-label", "匯入資料"); ta.focus(); ta.select();
          msg.textContent = "無法自動複製，已選取下方文字，請按 Ctrl＋C（Mac 為 ⌘＋C）。";
        }
        try {
          navigator.clipboard.writeText(payload).then(function () { msg.textContent = "已複製 " + rows.length + " 個候選情境。到工作台貼上即可。"; }, fallback);
        } catch (e) { fallback(); }
      });
      row.appendChild(msg); row.appendChild(btn); c1.appendChild(row);
      p.appendChild(c1);

      var two = h("div", "two-col");
      var c2 = h("div", "card");
      c2.innerHTML = "<figcaption>段 2｜競爭集合種子<small>代表性新創</small></figcaption><ul class='plain-list'>" +
        d.examples.map(function (e) { return "<li><b>" + esc(e.name) + "</b>（" + esc(e.country) + "）<br><small>" + esc(e.note) + "</small></li>"; }).join("") +
        "</ul><p class='copy-msg'>這只是起點。段 2 會再補上 status quo、內部自建與人工等替代方案，並做六面向輪廓。</p>";
      var c3 = h("div", "card");
      var partners = d.taiwan.filter(function (x) { return x.level >= 2; }).sort(function (a, b) { return b.level - a.level; });
      c3.innerHTML = "<figcaption>段 5｜台灣夥伴候選<small>優勢與具基礎環節</small></figcaption><ul class='plain-list'>" +
        partners.map(function (x) { var L = LEVEL[x.level]; return "<li><span class='lv " + L.cls + "'><i>" + L.icon + "</i>" + L.text + "</span>　<b>" + esc(x.seg) + "</b><br><small>" + esc(x.firms) + "</small></li>"; }).join("") +
        "</ul><p class='copy-msg'>名單為公開資訊推導，接觸前需確認合作意願與能力。</p>";
      two.appendChild(c2); two.appendChild(c3);
      p.appendChild(two);
    }
    pick(0);
  }

  renderHero();
  renderMethod();
  renderOverview();
  renderHeatmap();
  renderRounds();
  renderInvestors();
  renderTabs();
  renderTaiwan();
  renderInsights();
  renderGtm();
})();
