<p align="center"><img src="docs/logo-512.png" width="140" alt="Kumo Bot"></p>
<h1 align="center">Kumo Bot 雲</h1>
<p align="center"><a href="README.md">Español</a></p>
<p align="center"><b>A crypto trading bot that runs in <i>your own cloud</i>, with your rules.</b><br>
Android app · Cloudflare Workers · GitHub Actions · free AI (with or without an account) · 100+ exchanges via ccxt</p>

---

> The app is currently in Spanish. This page explains what Kumo is for English-speaking users.

## What is it?

Kumo is **free and open source** (MIT). Each person installs their own copy on their own free
GitHub and Cloudflare accounts: **nobody else ever sees your keys or your portfolio**, not even the
maintainer of this repository. There is no central server to hack and no database to leak.

- **Starts in simulation**: virtual portfolio with real prices. Real money is enabled by hand, with double confirmation.
- **Clear rules**: target allocation per coin, buy on low RSI, sell with profit. By default it **never sells at a loss**.
- **Optional, free AI**: vetoes or confirms trades, gives live signals, proposes orders you approve, analyzes coins and explains problems. Works with any OpenAI-compatible provider: **Kilo with no account or key**, Groq, Google AI Studio, OpenRouter, Mistral…
- **AI orders**: the AI proposes, you approve, edit or cancel (or let it execute on its own).
- **Per-asset charts**: price with your average cost, RSI and MACD on 1H, 4H and 1D, from your exchange's candles.
- **Real-time traffic light**: cloud, cycles, AI and exchange; when something fails it tells you how to fix it, and **"Find and fix"** repairs it automatically when it's safe.
- **Hyperliquid prediction markets**: your HIP-4 positions with name, value and expiry; the AI suggests hold / sell / buy more — **you decide**.
- **Any exchange**: Hyperliquid and MEXC (no KYC), Kraken, Coinbase, Crypto.com, Bitstamp, Gate… and any [ccxt](https://github.com/ccxt/ccxt) id.
- **Simple mode** for beginners and 5 visual themes.

## How to install (from the app)

1. Install the APK from [Releases](../../releases) on Android.
2. Choose **Crear mi nube** (create my cloud) and follow the wizard:
   - **GitHub**: classic token with `repo` and `workflow` scopes.
   - **Cloudflare**: API token from the **"Edit Cloudflare Workers"** template.
   - **AI** (optional): choose **Kilo** and you need no account.
   - **Exchange**: API key **with trading only, never withdrawals** (or start without keys).
3. The app creates a private `your-user/kumo-nube` repo from this template, stores the keys as
   encrypted GitHub secrets, deploys the Worker to your Cloudflare and runs the first cycle.

## Architecture

```
 Android app ──HTTPS + token──▶ Worker on YOUR Cloudflare (config, state, AI, alerts)
                                      ▲
                                      │ report of each cycle
 GitHub Actions on YOUR private repo ─┘  (every 30 min: reads prices, decides, trades with ccxt)
   └─ encrypted secrets: exchange keys, AI, Cloudflare
```

- `runner/`: Python engine (strategy, AI, exchange adapters). Tests: `python -m unittest discover -s runner/tests`.
- `worker/`: cloud API (TypeScript, KV). Never receives the exchange keys.
- `.github/workflows/`: install, cycle (every 30 min) and diagnostics.
- `app/android/`: native WebView app with native notifications. UI tests: `node app/pruebas/ui.test.js`.

## Free-tier limits

- **GitHub Actions** (private repo): 2,000 min/month; one cycle every 30 min uses ~1,440.
- **Cloudflare KV**: ~5 writes per cycle (~250/day), under the free 1,000/day.
- Binance, Bybit, OKX, KuCoin and Bitget block the US servers GitHub Actions runs on.

## Security

- Exchange keys only exist as encrypted secrets of **your** repository.
- Always create exchange keys **without withdrawal permission** (on Hyperliquid, use an *API wallet*).
- Trading is risky: only use money you can afford to lose. Nothing here is financial advice.

## ☕ Support

Kumo is free. Donations (BTC, XMR, USDC on Arbitrum) are in the app under Config → Apoya al desarrollador.

Changelog (Spanish): [CHANGELOG.md](CHANGELOG.md). License: MIT.
