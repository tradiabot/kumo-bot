# Novedades de Kumo Bot

Para actualizar: instala la APK nueva encima de la anterior (se conservan tus datos) y en la app
toca **Config → Actualizar nube** para que tu nube reciba el código nuevo.

## v1.5.1 — Modo simple y donaciones en USDC

- **🌱 Modo simple:** abajo solo Panel, Cartera y Config. El Panel muestra lo que dice la IA
  (toca una moneda para ver su gráfica) y las órdenes por aprobar, con ✔ Aprobar / ✖ Rechazar.
  Las instalaciones nuevas empiezan en simple; se cambia en Config → Interfaz o en la bienvenida.
  Quien ya usaba la app sigue en modo completo.
- **Donaciones en USDC por Arbitrum** (mínimo 5 USDC), con QR, copiar y botón de billetera.
  Desde Hyperliquid: Retirar → Arbitrum a esa dirección.
- El semáforo compara tu nube con la versión mínima que necesita la app (ya no marca «nube vieja»
  cuando solo cambió la app). Esta versión **no necesita actualizar la nube**.

## v1.5.0 — Gráficas por activo y semáforo con autocorrección

- **📈 Gráficas por activo.** Toca una moneda en *Cartera* (o una señal en *IA*) y se abre su gráfica
  en 1H, 4H o 1D con velas de **tu** exchange:
  - precio con tu **costo promedio** y las **órdenes con límite** que tengas;
  - **RSI 14** marcado con *tus* umbrales de compra y venta; **MACD 12/26/9** con histograma;
  - al deslizar el dedo: fecha, cierre, RSI y MACD de cada vela;
  - tu posición (cantidad, valor, ganancia, peso vs. meta), la última opinión de la IA y botones
    para **crear una orden** o **pedírsela a la IA** con esa moneda.
- **🚦 Semáforo en Config.** Cuatro luces en tiempo real: **Nube**, **Ciclos**, **IA** y **Exchange**.
  Se revisa cada 20 s mientras estás en Config; la IA se prueba al entrar y cada 5 min.
  Si algo falla, cada luz explica qué pasa y cómo arreglarlo, con botón.
- **🔍 Buscar y corregir.** Revisa todo, prueba cada modelo de IA y:
  - arregla solo lo seguro: deja como principal el modelo de IA que responde, reactiva los
    ciclos si GitHub los apagó por inactividad, lanza un ciclo si van atrasados y reinstala la nube
    si no responde;
  - si la IA funciona, explica el problema en palabras simples y recomienda arreglos (solo de una
    lista fija; nunca cambia montos, reparto ni el modo real sin tu confirmación).
- Nube: `GET /api/graficas`, `GET /api/semaforo`, `POST /api/ia/probar`, `POST /api/ia/diagnosticar`.
  Una escritura de KV más por ciclo (velas), dentro del plan gratis.
- El diagnóstico (workflow «Diagnóstico Kumo») también revisa gráficas, semáforo y la prueba de IA.

## v1.4.0 — Pestañas Órdenes e Historial

- **⇅ Órdenes:** la IA propone órdenes y tú las apruebas, editas (a mano o pidiéndoselo a la IA) o
  cancelas. Tres modos: *IA propone · tú apruebas*, *IA ejecuta sola* (pide confirmación) o
  *Solo yo*. Órdenes manuales con precio límite y opción de vender con pérdida; caducan solas.
- **☰ Historial:** registro de cada ciclo, cada respuesta de la IA (modelo y segundos), órdenes y
  errores, con filtros y un panel «¿Está funcionando la IA?».

## v1.3.7 — Señales de la IA en vivo

- La IA da su señal (COMPRAR / VENDER / ESPERAR con % de confianza) en cada ciclo para tu reparto
  y lo que tienes, aunque no haya operaciones propuestas.
- Pestaña IA con señales en vivo, historial de señales y qué pasó con cada orden.
- Las señales fuertes crean órdenes (escaladas por confianza entre tu monto mínimo y máximo).

## v1.3.6 — Barra y cuenta regresiva de cada ciclo

- El Panel muestra el avance del ciclo y una cuenta regresiva mm:ss hasta el próximo.
- Tras «Ciclo ahora» la barra sigue los pasos reales de GitHub Actions.
- Hyperliquid: el aviso de USDC en Perps solo sale si Spot está vacío (cuenta unificada).

## v1.3.5 — Errores viejos y versión real de la nube

- Los errores de ciclos anteriores a «Cambiar claves» se marcan como viejos.
- La gráfica del Panel se reinicia al cambiar de exchange o entre simulación y real.
- La app muestra la versión real del código de tu nube.

## v1.3.4 — La nube no se degrada y cuenta principal de Hyperliquid

- «Actualizar nube» nunca copia una plantilla más vieja encima de una nube más nueva.
- Hyperliquid: si pegas la dirección de una API wallet, se usa tu cuenta principal (con aviso).
- Nuevo workflow «Diagnóstico Kumo» (exchange, IA y nube sin imprimir claves ni montos).

## v1.3.3 — Saldo real del exchange

- El Panel muestra el saldo real del exchange (solo lectura), también en simulación, para
  comprobar tus claves antes de usar dinero real.

## v1.3.2 — «Cambiar claves» completo

- Al reinstalar trae primero el código más reciente; permite cambiar Cloudflare y mantener lo que
  no cambias (Cloudflare, exchange y sus claves).

## v1.3.1 — Porcentaje al crear la nube

- Barra con porcentaje y paso en curso durante la instalación.

## v1.3.0 — IA gratis con cualquier proveedor

- Kilo (sin cuenta ni clave), Groq, Google AI Studio, OpenRouter, Mistral u otro compatible con
  OpenAI. Las nubes con `GROQ_API_KEY` siguen funcionando.
