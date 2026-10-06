<p align="center"><img src="docs/logo-512.png" width="140" alt="Kumo Bot"></p>
<h1 align="center">Kumo Bot 雲</h1>
<p align="center"><a href="README.en.md">English</a></p>
<p align="center"><b>Bot de trading cripto que corre en <i>tu propia nube</i>, con tus reglas.</b><br>
<a href="#-apoya-al-desarrollador">☕ Donar</a> · App Android · Cloudflare Workers · GitHub Actions · IA gratis (con o sin cuenta) · 100+ exchanges vía ccxt</p>

---

## ¿Qué es?

Kumo es un proyecto **abierto y gratuito**. Cada persona instala su propia copia en sus cuentas
gratis de GitHub y Cloudflare: **nadie más ve tus claves ni tu cartera**, ni siquiera quien
mantiene este repositorio.

- **Empieza en simulación**: cartera virtual con precios reales. El dinero real se activa a mano, con doble confirmación.
- **Reglas claras**: reparto objetivo por moneda, compra con RSI bajo, vende con ganancia. Por defecto **nunca vende con pérdida**.
- **IA opcional y gratis**: puede vetar o confirmar cada operación y analiza monedas en el Radar. Funciona con cualquier proveedor compatible con OpenAI del catálogo de [itsfree.ai](https://itsfree.ai): **Kilo sin cuenta ni clave**, Groq, Google AI Studio, OpenRouter, Mistral u otro.
- **Cualquier exchange**: Crypto.com (App y Exchange), Kraken, Coinbase, Bitstamp, MEXC, Gate… y cualquier id de [ccxt](https://github.com/ccxt/ccxt).
- **Órdenes con IA**: la IA propone órdenes y tú las apruebas, editas o cancelas (o la dejas ejecutar sola). También creas las tuyas con precio límite.
- **Gráficas por activo**: precio con tu costo promedio, RSI y MACD en 1H, 4H y 1D, con velas de tu exchange.
- **Semáforo en tiempo real**: nube, ciclos, IA y exchange; si algo falla te dice cómo arreglarlo y **«Buscar y corregir»** lo arregla solo cuando es seguro.
- **Predicciones de Hyperliquid**: tus mercados de predicción con nombre, valor y vencimiento; la IA los analiza y te sugiere qué hacer (tú decides).
- **Modo simple**: solo Panel, Cartera y Config para quien empieza.
- **Historial y señales en vivo**: qué dijo la IA en cada ciclo, con qué modelo y cuánto tardó.
- **App con 5 interfaces**: Pro Grafito y Pro Porcelana, Neón Noche y Neón Día (manga cyberpunk) o Clásica.

Novedades de cada versión: [CHANGELOG.md](CHANGELOG.md).

## Cómo se instala (desde la app)

1. Instala la APK de [Releases](../../releases) en Android.
2. En la bienvenida elige **Crear mi nube** y sigue el asistente:
   - **GitHub**: token clásico con permisos `repo` y `workflow`.
   - **Cloudflare**: API token con la plantilla **«Edit Cloudflare Workers»**.
   - **IA** (opcional): elige **Kilo** y no necesitas cuenta; o pega una clave gratis de Groq, Google AI Studio, OpenRouter o Mistral.
   - **Exchange**: API key **solo con trading, nunca con retiros** (o empieza sin claves).
3. La app crea `tu-usuario/kumo-nube` (privado) desde esta plantilla, guarda las claves como
   *secretos cifrados* de GitHub, despliega el Worker en tu Cloudflare y lanza el primer ciclo.

## Arquitectura

```
 App Android ──HTTPS + token──▶ Worker en TU Cloudflare (config, estado, IA del Radar, avisos)
                                      ▲
                                      │ reporte de cada ciclo
 GitHub Actions en TU repo privado ───┘  (cada 30 min: lee precios, decide, opera con ccxt)
   └─ secretos cifrados: claves del exchange, IA (IA_URL, IA_MODELOS, IA_CLAVE), Cloudflare
```

- `runner/`: motor en Python (estrategia, IA, adaptadores de exchange). Pruebas: `python -m unittest discover -s runner/tests`.
- `worker/`: API de la nube (TypeScript, KV). Nunca recibe las claves del exchange.
- `.github/workflows/`: `instalar.yml` (despliega la nube), `ciclo.yml` (un ciclo cada 30 min) y `diagnostico.yml` (revisa exchange, IA y nube sin imprimir claves).
- `app/android/`: app nativa con WebView (`assets/www/index.html`) y notificaciones nativas.

## Límites del plan gratis

- **GitHub Actions** (repo privado): 2.000 min/mes. Un ciclo cada 30 min usa ~1.440.
- **Cloudflare Workers/KV**: unas 5 escrituras por ciclo (~250 al día), por debajo del límite gratis de 1.000.
- **Binance, Bybit, OKX, KuCoin y Bitget** bloquean los servidores de EE. UU. donde corre GitHub Actions, por eso la app ya no los ofrece.
- **Sin KYC:** Hyperliquid (DEX: te conectas con dirección + clave de una *API wallet* que puede operar pero no retirar; orden mínima 10 USDC) y MEXC (cuenta sin verificar con límite de retiro).

## Seguridad

- Las claves del exchange solo existen como secretos cifrados de **tu** repositorio.
- La app guarda en el teléfono solo la dirección de tu nube, su token y, opcionalmente, el token de GitHub (para «Ciclo ahora»). Puedes borrarlo en Config.
- Crea siempre claves de exchange **sin permiso de retiro**.

## ☕ Apoya al desarrollador

Kumo es gratis y abierto. Si te sirve, puedes invitar un café al desarrollador con una donación voluntaria:

<table>
<tr>
<td align="center" width="50%">
<img src="docs/donar/bitcoin.svg" width="48" alt="Bitcoin"><br><b>Bitcoin (BTC)</b><br><br>
<img src="docs/donar/qr-bitcoin.svg" width="180" alt="QR Bitcoin"><br>
<sub><code>bc1qd9j45f4t0jwyhjhqh2kvz2cr7k8xye460rr2y7</code></sub>
</td>
<td align="center" width="50%">
<img src="docs/donar/monero.svg" width="48" alt="Monero"><br><b>Monero (XMR)</b><br><br>
<img src="docs/donar/qr-monero.svg" width="180" alt="QR Monero"><br>
<sub><code>447gTj6Hg6gaAEAUmjqfhqDZr1PziUTvbT4LYLpmLVnTNVFK6cqeqPfh6P4neMKLWX5jDXAr94fWHacJwDvjmCzBBH8wPBt</code></sub>
</td>
</tr>
</table>

Envía solo **BTC por la red Bitcoin** a la dirección de Bitcoin y solo **XMR** a la de Monero. También puedes donar desde la app: **Config → Apoya al desarrollador**.

> ⚠️ El trading de criptomonedas tiene riesgo. Kumo no es asesoría financiera. Usa solo dinero que puedas perder.

Licencia [MIT](LICENSE).
