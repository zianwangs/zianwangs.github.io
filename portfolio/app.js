(() => {
  const CFG = window.PORTFOLIO_CONFIG;
  const BASE = CFG.baseValue ?? 100;
  const MINUS = "\u2212";
  const FONT = '"Instrument Sans", -apple-system, "Helvetica Neue", Arial, sans-serif';

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (n, d = 2) => (n == null || !isFinite(n)) ? "–" :
    n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (n, d = 2) => (n == null || !isFinite(n)) ? "–" :
    (n >= 0 ? "+" : MINUS) + Math.abs(n * 100).toFixed(d) + "%";
  const pts = n => (n == null || !isFinite(n)) ? "–" :
    (n >= 0 ? "+" : MINUS) + Math.abs(n).toFixed(2);

  /* ---------- data ---------- */

  const toTs = d => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
  const cache = new Map();

  function loadSymbol(symbol, p1, p2) {
    if (!cache.has(symbol)) cache.set(symbol, fetchSymbol(symbol, p1, p2));
    return cache.get(symbol);
  }

  async function fetchSymbol(symbol, p1, p2) {
    const base = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(symbol) +
      "?period1=" + p1 + "&period2=" + p2 + "&interval=1d&events=div%7Csplit";
    const attempts = [(CFG.proxies || []).map(p => p + encodeURIComponent(base))];
    let lastErr;
    for (const url of attempts) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();
        const res = j.chart && j.chart.result && j.chart.result[0];
        if (!res) throw new Error((j.chart && j.chart.error && j.chart.error.description) || "No data");
        const off = res.meta.gmtoffset || 0;
        const closes = res.indicators.quote[0].close || [];
        const out = [];
        (res.timestamp || []).forEach((t, i) => {
          if (closes[i] == null) return;
          out.push({ d: new Date((t + off) * 1000).toISOString().slice(0, 10), p: closes[i] });
        });
        if (!out.length) throw new Error("No prices returned");
        return out;
      } catch (e) { lastErr = e; }
    }
    throw new Error(symbol + ": " + (lastErr ? lastErr.message : "request failed"));
  }

  /* ---------- model ---------- */

  function compute(s, data) {
    const totalW = s.legs.reduce((a, l) => a + (l.weight ?? 1), 0);
    const legs = s.legs.map(l => ({
      ...l,
      sign: l.side === "short" ? -1 : 1,
      w: (l.weight ?? 1) / totalW,
      series: data[l.symbol]
    }));

    legs.forEach(l => {
      if (l.startPrice == null) {
        const first = l.series.find(pt => pt.d >= s.startDate);
        l.p0 = first ? first.p : null;
      } else l.p0 = l.startPrice;
      if (l.p0 == null) throw new Error(l.symbol + ": no price on or after " + s.startDate);
    });

    const set = new Set();
    legs.forEach(l => l.series.forEach(pt => { if (pt.d >= s.startDate) set.add(pt.d); }));
    const dates = [...set].sort();

    const ptr = legs.map(() => -1);
    const rows = [];
    for (const d of dates) {
      const prices = [];
      let ok = true;
      legs.forEach((l, i) => {
        while (ptr[i] + 1 < l.series.length && l.series[ptr[i] + 1].d <= d) ptr[i]++;
        if (ptr[i] < 0) ok = false; else prices.push(l.series[ptr[i]].p);
      });
      if (!ok) continue;
      let v = 0;
      legs.forEach((l, i) => { v += l.w * l.sign * (prices[i] / l.p0 - 1); });
      rows.push({ d, v: BASE * (1 + v), prices });
    }
    if (!rows.length) throw new Error("No data on or after " + s.startDate);

    const last = rows[rows.length - 1];
    const prev = rows.length > 1 ? rows[rows.length - 2] : null;
    let peak = -Infinity, mdd = 0;
    rows.forEach(r => { peak = Math.max(peak, r.v); mdd = Math.min(mdd, r.v / peak - 1); });
    const vs = rows.map(r => r.v);
    const high = Math.max(...vs) / BASE - 1;
    const low = Math.min(...vs) / BASE - 1;

    return {
      rows, legs, last, prev,
      ret: last.v / BASE - 1,
      day: prev ? last.v / prev.v - 1 : null,
      mdd, high, low
    };
  }

  /* ---------- render ---------- */

  const tipStyle = {
    backgroundColor: "#fff", titleColor: "#000", bodyColor: "#000",
    borderColor: "#000", borderWidth: 1, padding: 10, displayColors: false,
    titleFont: { family: FONT, weight: "600" }, bodyFont: { family: FONT }
  };

  function baseOptions(legend) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      elements: { point: { radius: 0, hoverRadius: 3 } },
      scales: {
        x: {
          grid: { display: false },
          border: { color: "#000" },
          ticks: { color: "#000", font: { family: FONT, size: 11 }, maxTicksLimit: 6, maxRotation: 0 }
        },
        y: {
          grid: { color: "#eee" },
          border: { display: false },
          ticks: { color: "#000", font: { family: FONT, size: 11 } }
        }
      },
      plugins: {
        legend: legend
          ? { position: "top", align: "start", labels: { color: "#000", font: { family: FONT, size: 12 }, boxWidth: 24, boxHeight: 2, usePointStyle: false } }
          : { display: false },
        tooltip: {
          ...tipStyle,
          filter: item => item.dataset.label !== "Start",
          callbacks: { label: c => (legend ? c.dataset.label + ": " : "") + num(c.parsed.y) }
        }
      }
    };
  }

  function legTable(r) {
    const head = "<tr><th>Position</th><th>Side</th><th>Weight</th><th>Start</th><th>Last</th><th>Move</th><th>Contribution</th></tr>";
    const body = r.legs.map((l, i) => {
      const last = r.last.prices[i];
      const move = last / l.p0 - 1;
      const contrib = BASE * l.w * l.sign * move;
      return "<tr><td class='name'>" + esc(l.symbol) + "</td><td>" + (l.sign < 0 ? "Short" : "Long") +
        "</td><td>" + (l.w * 100).toFixed(0) + "%</td><td>" + num(l.p0) + "</td><td>" + num(last) +
        "</td><td>" + pct(move) + "</td><td>" + pts(contrib) + "</td></tr>";
    }).join("");
    return "<table>" + head + body + "</table>";
  }

  function renderStrategy(s, i, r) {
    const el = document.createElement("section");
    el.className = "strat";
    el.id = "s" + i;
    el.innerHTML =
      "<div class='head'><div><h2>" + esc(s.name) + "</h2><p class='note'>" +
      (s.note ? esc(s.note) + ", " : "") + "since " + esc(s.startDate) + "</p></div>" +
      "<div class='val'><span class='big'>" + num(r.last.v) + "</span><span class='sub'>" +
      pct(r.ret) + " since start</span></div></div>" +
      "<div class='stats'>" +
      "<div><span>Last close</span><b>" + esc(r.last.d) + "</b></div>" +
      "<div><span>1 day</span><b>" + pct(r.day) + "</b></div>" +
      "<div><span>Peak return</span><b>" + pct(r.high) + "</b></div>" +
      "<div><span>Lowest return</span><b>" + pct(r.low) + "</b></div>" +
      "<div><span>Max drawdown</span><b>" + pct(r.mdd) + "</b></div>" +
      "<div><span>Trading days</span><b>" + r.rows.length + "</b></div></div>" +
      "<div class='chart'><canvas role='img' aria-label='" + esc(s.name) + " value'></canvas></div>" +
      "<div class='scroll'>" + legTable(r) + "</div>";
    $("#list").appendChild(el);

    const labels = r.rows.map(x => x.d);
    new Chart($("canvas", el), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: s.name, data: r.rows.map(x => x.v), borderColor: "#000", borderWidth: 1.5, tension: 0 },
          { label: "Start", data: labels.map(() => BASE), borderColor: "#999", borderWidth: 1, borderDash: [4, 4] }
        ]
      },
      options: baseOptions(false)
    });
  }

  function renderOverview(items) {
    const ok = items.filter(x => x.r);
    if (!ok.length) return;
    $("#overview").hidden = false;

    const all = [...new Set(ok.flatMap(x => x.r.rows.map(p => p.d)))].sort();
    const styles = [
      { c: "#000", dash: [] }, { c: "#555", dash: [] }, { c: "#999", dash: [] },
      { c: "#000", dash: [6, 4] }, { c: "#555", dash: [6, 4] }, { c: "#999", dash: [6, 4] }
    ];
    new Chart($("#cmp"), {
      type: "line",
      data: {
        labels: all,
        datasets: ok.map((x, k) => {
          const m = new Map(x.r.rows.map(p => [p.d, p.v]));
          const st = styles[k % styles.length];
          return { label: x.s.name, data: all.map(d => m.has(d) ? m.get(d) : null),
                   borderColor: st.c, borderDash: st.dash, borderWidth: 1.5, spanGaps: true };
        })
      },
      options: baseOptions(true)
    });

    const head = "<tr><th>Strategy</th><th>Start date</th><th>Value</th><th>Return</th><th>1 day</th><th>Peak</th><th>Low</th><th>Max drawdown</th></tr>";
    const body = items.map((x, i) => x.r
      ? "<tr><td class='name'><a href='#s" + i + "'>" + esc(x.s.name) + "</a></td><td>" + esc(x.s.startDate) +
        "</td><td>" + num(x.r.last.v) + "</td><td>" + pct(x.r.ret) + "</td><td>" + pct(x.r.day) +
        "</td><td>" + pct(x.r.high) + "</td><td>" + pct(x.r.low) + "</td><td>" + pct(x.r.mdd) + "</td></tr>"
      : "<tr><td class='name'>" + esc(x.s.name) + "</td><td colspan='7'>Unavailable</td></tr>").join("");
    $("#sum").innerHTML = head + body;
  }

  /* ---------- main ---------- */

  async function main() {
    document.title = CFG.title || "Strategy portfolios";
    $("#title").textContent = CFG.title || "Strategy portfolios";

    const symbols = [...new Set(CFG.strategies.flatMap(s => s.legs.map(l => l.symbol)))];
    const earliest = CFG.strategies.map(s => s.startDate).sort()[0];
    const p1 = toTs(earliest) - 10 * 86400;
    const p2 = Math.floor(Date.now() / 1000) + 86400;

    const results = await Promise.allSettled(symbols.map(sym => loadSymbol(sym, p1, p2)));
    const data = {}, failed = {};
    results.forEach((res, i) => {
      if (res.status === "fulfilled") data[symbols[i]] = res.value;
      else failed[symbols[i]] = res.reason.message;
    });

    const items = CFG.strategies.map(s => {
      try {
        const bad = s.legs.find(l => failed[l.symbol]);
        if (bad) throw new Error(failed[bad.symbol]);
        return { s, r: compute(s, data) };
      } catch (e) { return { s, err: e.message }; }
    });

    items.forEach((x, i) => {
      if (x.r) renderStrategy(x.s, i, x.r);
      else {
        const el = document.createElement("section");
        el.className = "strat";
        el.id = "s" + i;
        el.innerHTML = "<h2>" + esc(x.s.name) + "</h2><div class='err'>Could not load this strategy. " + esc(x.err) + "</div>";
        $("#list").appendChild(el);
      }
    });
    // renderOverview(items);

    const meta = $("#meta");
    meta.classList.remove("loading");
    meta.textContent = "Updated " + new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) +
      ", base " + BASE;
  }

  main().catch(e => {
    const meta = $("#meta");
    meta.textContent = "Failed to load: " + e.message;
  });
})();
