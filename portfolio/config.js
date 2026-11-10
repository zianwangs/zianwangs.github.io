/*
  Strategy list. Edit this file only.

  Per strategy:
    name        display name
    note        optional one-line description
    startDate   "YYYY-MM-DD", the day the strategy starts (value = baseValue on this day)
    legs        list of positions:
      symbol      Yahoo Finance ticker (000660.KS = SK Hynix, MU = Micron, KO, LLY ...)
      side        "long" or "short"
      startPrice  price when you opened it. Use null to take the close on startDate.
      weight      optional relative size (default 1). Weights are normalised, so
                  two legs with weight 1 each are 50% / 50% of baseValue.

  Value model: static weights set on startDate, no rebalancing.
    value = baseValue * (1 + sum( weight * (+1 long | -1 short) * (price / startPrice - 1) ))
*/
window.PORTFOLIO_CONFIG = {
  title: "Strategy portfolios",
  baseValue: 100,

  // Tried in order if the direct Yahoo request is blocked by the browser (CORS).
  // For a stable setup, replace with your own Cloudflare Worker URL, e.g. "https://your-worker.workers.dev/?url="
  proxies: [
    "https://eumathes.yaphters.workers.dev/?url=",
  ],

  strategies: [
    {
      name: "碧海红光",
      note: "Long SK Hynix, Short Micron",
      startDate: "2026-07-29",
      legs: [
        { symbol: "000660.KS", side: "long",  startPrice: 1350000, weight: 1 },
        { symbol: "MU",        side: "short", startPrice: 750, weight: 1 }
      ]
    },
    {
      name: "卡路里税",
      note: "Long Coca-Cola, Long Eli Lilly",
      startDate: "2026-10-31",
      legs: [
        { symbol: "KO",  side: "long", startPrice: 94.08, weight: 1 },
        { symbol: "LLY", side: "long", startPrice: 1417.54, weight: 1 }
      ]
    },
    {
      name: "中概十雄",
      note: "Long the 10 Goats",
      startDate: "2026-11-10",
      legs: [
        { symbol: "600519.SS",  side: "long", startPrice: 1439, weight: 1 },
        { symbol: "1398.HK", side: "long", startPrice: 7.990, weight: 1 },
        { symbol: "1288.HK", side: "long", startPrice: 6.995, weight: 1 },
        { symbol: "0939.HK", side: "long", startPrice: 10.64, weight: 1 },
        { symbol: "3988.HK", side: "long", startPrice: 6.255, weight: 1 },
        { symbol: "3968.HK", side: "long", startPrice: 54.5, weight: 1 },
        { symbol: "0883.HK", side: "long", startPrice: 22.76, weight: 1 },
        { symbol: "0700.HK", side: "long", startPrice: 417.8, weight: 1 },
        { symbol: "PDD",     side: "long", startPrice: 80.5, weight: 1 },
        { symbol: "NTES",    side: "long", startPrice: 129.65, weight: 1 },
      ]
    }
  ]
};
