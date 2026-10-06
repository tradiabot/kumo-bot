const {JSDOM}=require('jsdom');const fs=require('fs');const nodeCrypto=require('crypto');
const WWW=require('path').join(__dirname,'../android/app/src/main/assets/www/');
const html=fs.readFileSync(WWW+'index.html','utf8').replace('<script src="sellar.js"></script>','<script>'+fs.readFileSync(WWW+'sellar.js','utf8')+'</script>');
const espera=ms=>new Promise(r=>setTimeout(r,ms));
let fallos=0;const ok=(c,m)=>{console.log((c?'OK  ':'FALLO ')+m);if(!c)fallos++};
function crear(fetchMock,nativo,guardado){
  const errores=[];
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://localhost/',beforeParse(w){
    w.fetch=fetchMock;if(nativo)w.KumoNative=nativo(w);if(guardado)w.localStorage.setItem('kumo',JSON.stringify(guardado));
    Object.defineProperty(w,'crypto',{value:nodeCrypto.webcrypto});w.TextEncoder=TextEncoder;w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};
    w.addEventListener('error',e=>errores.push(e.message));
  }});
  dom.window.console.error=(...a)=>errores.push(a.join(' '));
  return {w:dom.window,d:dom.window.document,errores};
}
const click=(d,sel)=>{const e=typeof sel==='string'?d.querySelector(sel):sel;if(!e)throw new Error('no existe '+sel);e.click()};
const R=(status,data,headers)=>Promise.resolve({ok:status<400,status,json:()=>Promise.resolve(data),text:()=>Promise.resolve(data==null?'':JSON.stringify(data)),headers:{get:k=>(headers||{})[k.toLowerCase()]||null}});

(async()=>{
 // ---------- 1) Primera vez + demo
 {
  const barras=[],copias=[],billeteras=[];
  const {w,d,errores}=crear(()=>R(500,{}),w=>({estado:()=>JSON.stringify({enabled:false,permiso:'denied'}),barras:(c,l)=>barras.push(c),abrirUrl(){},http(){},copiar:t=>copias.push(t),abrirBilletera:u=>{billeteras.push(u);return u.startsWith('bitcoin:')}}));
  await espera(50);
  ok(d.getElementById('tuto').classList.contains('open'),'tutorial emergente al abrir por primera vez');
  ok(/vacía/.test(d.getElementById('tutoCuerpo').textContent),'el tutorial avisa que la app viene vacía');
  for(let i=0;i<5;i++)click(d,'#tutoSig');
  ok(d.getElementById('tutoN').textContent==='6'&&d.getElementById('tutoSig').disabled,'último paso bloqueado hasta marcar «Entendí»');
  ok(w.appBack()===true&&d.getElementById('tutoN').textContent==='5','atrás de Android retrocede en el tutorial');
  click(d,'#tutoSig');d.getElementById('tutoOk').checked=true;d.getElementById('tutoOk').dispatchEvent(new w.Event('change'));click(d,'#tutoSig');
  ok(!d.getElementById('tuto').classList.contains('open')&&w.__kumo.S.tuto===true,'tutorial completado y recordado');
  ok(d.getElementById('onb').classList.contains('open'),'bienvenida abierta en la primera ejecución');
  ok(d.querySelector('.paso.activo').dataset.paso==='hola','empieza en el saludo');
  click(d,'[data-paso="hola"] [data-ir="tema"]');
  ok(d.documentElement.dataset.tema==='pro'&&d.documentElement.dataset.estilo==='pro','tema Pro Grafito por defecto');
  ok(d.querySelector('#temas [data-tema="pro"]').classList.contains('sel'),'Pro marcado en el selector');
  click(d,'#temas [data-tema="pro-claro"]');ok(d.documentElement.dataset.estilo==='pro'&&barras.includes('#f5f6fa'),'Pro Porcelana aplicado con barras claras');
  click(d,'#temas [data-tema="dia"]');
  ok(d.documentElement.dataset.tema==='dia'&&d.documentElement.dataset.estilo==='manga','tema Neón Día aplicado');
  ok(barras.includes('#fff7ea'),'barras del sistema coloreadas por el tema');
  click(d,'#temas [data-tema="clasica"]');ok(d.documentElement.dataset.estilo==='clasica','tema Clásica sin estilo manga');
  click(d,'#temas [data-tema="noche"]');
  click(d,'[data-paso="tema"] [data-ir="inicio"]');
  click(d,'#onbDemo');await espera(50);
  ok(!d.getElementById('onb').classList.contains('open'),'demo cierra la bienvenida');
  ok(!d.getElementById('demoBanda').classList.contains('oculto'),'banda de demo visible');
  ok(/1.*034/.test(d.getElementById('total').textContent),'valor total demo: '+d.getElementById('total').textContent);
  ok(d.querySelectorAll('#decisiones .row').length>=1,'decisiones del último ciclo');
  ok(d.getElementById('modoPill').textContent==='SIMULACIÓN','pill de simulación');
  ok(d.getElementById('chLinea').getAttribute('d').length>100,'gráfico dibujado');
  click(d,'.nav [data-target="radar"]');await espera(30);
  ok(d.querySelectorAll('#radarLista .card').length===8,'radar con 8 monedas');
  click(d,'#radarFiltro [data-f="baratas"]');ok(d.querySelectorAll('#radarLista .card').length===2,'filtro RSI bajo (≤40) = SOL y PEPE');
  click(d,'#radarFiltro [data-f="todas"]');
  click(d,'#radarLista [data-analizar="SOL"]');await espera(30);
  ok(/INCORPORAR/.test(d.querySelector('#radarLista .analisis').textContent),'análisis IA con veredicto');
  click(d,'#radarLista [data-incluir="SOL"]');await espera(30);
  ok(d.getElementById('modal').classList.contains('open'),'modal de inclusión');
  d.getElementById('incPct').value='5';click(d,'#mSi');await espera(30);
  ok(w.__kumo.datos.config.objetivo.SOL===5,'SOL incluida con 5%');
  d.getElementById('radarQ').value='ADA';d.getElementById('radarForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  ok(/PEDIR DATOS DE ADA/.test(d.getElementById('radarAnalisis').textContent),'búsqueda sin datos ofrece pedirlos');
  click(d,'#radarLista [data-incluir="PEPE"]');await espera(30);
  ok(/NO INCORPORAR/.test(d.getElementById('mTexto').textContent),'advierte al incluir con veredicto negativo');click(d,'#mNo');
  click(d,'.nav [data-target="estrategia"]');await espera(20);
  ok(d.querySelectorAll('#reparto .alloc').length===3,'reparto con 3 monedas');
  click(d,'#perfiles [data-p="prudente"]');ok(d.querySelector('[data-p="monto_max"]').value==='10','perfil prudente aplicado');
  d.getElementById('repNuevo').value='link';click(d,'#repAgregar');ok(d.querySelectorAll('#reparto .alloc').length===4,'agregar LINK');
  click(d,'#estGuardar');await espera(30);ok(w.__kumo.datos.config.objetivo.LINK===5&&w.__kumo.datos.config.monto_max===10,'estrategia guardada');
  click(d,'.nav [data-target="cartera"]');await espera(30);
  ok(d.querySelectorAll('#activos .row').length===4&&d.querySelectorAll('#operaciones .row').length===2,'cartera y operaciones');
  click(d,'.nav [data-target="ia"]');await espera(30);ok(/Rebote/.test(d.getElementById('opiniones').textContent),'opiniones de la IA');
  ok(/EJECUTADA/.test(d.getElementById('ordenesIA').textContent)&&/FRENADA POR LA IA/.test(d.getElementById('ordenesIA').textContent)&&/IA: COMPRAR 68%/.test(d.getElementById('ordenesIA').textContent),'órdenes según la IA con su resultado');
  click(d,'.nav [data-target="ordenes"]');await espera(30);
  {const P=()=>d.getElementById('ordPend'),H=()=>d.getElementById('ordHechas');
   ok(d.querySelectorAll('.nav button').length===8,'barra inferior con Órdenes e Historial');
   ok(/SOL/.test(P().textContent)&&/PROPUESTA/.test(P().textContent)&&/🤖 IA/.test(P().textContent)&&/Esperando precio/.test(P().textContent),'órdenes pendientes: propuesta de la IA y la tuya esperando precio');
   ok(/EJECUTADA/.test(H().textContent),'órdenes recientes');
   click(d,'#ordPend [data-oid="d1"] [data-oa="aprobar"]');await espera(20);click(d,'#mSi');await espera(50);
   ok(/APROBADA/.test(d.querySelector('#ordPend [data-oid="d1"]').textContent),'aprobar una orden de la IA');
   click(d,'#ordPend [data-oid="d1"] [data-oa="editar"]');const inp=d.querySelector('#ordPend [data-oid="d1"] [data-ec="cant"]');inp.value='13';click(d,'#ordPend [data-oid="d1"] [data-oa="guardar"]');await espera(50);
   ok(/13 USDT/.test(d.querySelector('#ordPend [data-oid="d1"]').textContent),'editar monto a mano: '+d.querySelector('#ordPend [data-oid="d1"]').textContent.slice(0,120));
   click(d,'#ordPend [data-oid="d1"] [data-oa="conia"]');d.querySelector('#ordPend [data-oid="d1"] [data-ec="ins"]').value='bájala 2';click(d,'#ordPend [data-oid="d1"] [data-oa="enviaria"]');await espera(50);
   ok(/PROPUESTA/.test(d.querySelector('#ordPend [data-oid="d1"]').textContent)&&/11 USDT/.test(d.querySelector('#ordPend [data-oid="d1"]').textContent),'editar con IA: vuelve a propuesta');
   d.getElementById('ordIAtxt').value='compra SOL';click(d,'#ordIApedir');await espera(50);
   ok(P().querySelectorAll('[data-oid]').length===3,'crear orden con IA');
   d.getElementById('onSym').value='hype';d.getElementById('onCant').value='12';click(d,'#onCrear');await espera(50);
   ok(/HYPE/.test(P().textContent)&&/👤 TÚ/.test(P().textContent),'crear orden manual');
   click(d,'#ordPend [data-oid="d2"] [data-oa="cancelar"]');await espera(50);
   ok(/CANCELADA/.test(H().textContent),'cancelar orden');
   click(d,'#ordModoChips [data-m="auto"]');await espera(20);ok(d.getElementById('modal').classList.contains('open'),'IA automática pide confirmación');click(d,'#mSi');await espera(50);
   ok(/IA AUTOMÁTICA/.test(d.getElementById('ordModo').textContent),'modo de órdenes guardado');}
  click(d,'.nav [data-target="historial"]');await espera(30);
  ok(/FUNCIONA/.test(d.getElementById('saludPill').textContent)&&/50%/.test(d.getElementById('saludPct').textContent),'historial: salud de la IA ('+d.getElementById('saludPct').textContent+')');
  ok(/HTTP 429/.test(d.getElementById('histLista').textContent)&&/Ciclo #58/.test(d.getElementById('histLista').textContent),'historial con logs de IA y ciclos');
  click(d,'#histFiltro [data-h="error"]');await espera(10);
  ok(!/Ciclo #58 OK/.test(d.getElementById('histLista').textContent)&&/HTTP 429/.test(d.getElementById('histLista').textContent),'filtro de errores');
  click(d,'.nav [data-target="ia"]');await espera(30);
  ok(/Radar/.test(d.getElementById('senalesHist').textContent)&&/Ciclo #57/.test(d.getElementById('senalesHist').textContent),'historial de señales');
  ok(/Ciclo #58/.test(d.getElementById('iaCab').textContent)&&/nemotron/.test(d.getElementById('iaCab').textContent),'cabecera: ciclo, hora y modelo');
  // ---- Gráficas por activo
  click(d,'.nav [data-target="cartera"]');await espera(30);
  ok(d.querySelectorAll('#activos [data-graf]').length===3&&!d.querySelector('#activos [data-graf="USDT"]'),'activos tocables (sin la moneda base)');
  click(d,'#activos [data-graf="BTC"] .info');await espera(40);
  const G=()=>d.getElementById('grafCuerpo');
  ok(d.getElementById('grafModal').classList.contains('open')&&d.getElementById('grafTitulo').textContent==='BTC','tocar BTC abre su gráfica');
  ok(G().querySelectorAll('svg').length===3&&/RSI 14/.test(G().textContent)&&/MACD/.test(G().textContent),'precio, RSI y MACD dibujados');
  ok(/100 velas 4H/.test(d.getElementById('grafSub').textContent),'4H por defecto: '+d.getElementById('grafSub').textContent);
  ok(G().querySelector('.costo')&&/tu costo/.test(G().textContent),'línea de tu costo promedio');
  ok(/Tienes/.test(d.getElementById('grafPos').textContent)&&/\+3,23%/.test(d.getElementById('grafPos').textContent),'resumen de tu posición');
  ok(/RSI \d+: zona/.test(G().querySelector('.notice').textContent),'lectura técnica según tu estrategia');
  const tf4=G().querySelector('path.serie').getAttribute('d');click(d,'#grafTf [data-tf="1d"]');
  ok(/1D/.test(d.getElementById('grafSub').textContent)&&G().querySelector('path.serie').getAttribute('d')!==tf4&&d.querySelector('#grafTf [data-tf="1d"]').classList.contains('active'),'cambiar a 1D');
  {const k=w.__kumo;const c=[44.34,44.09,44.15,43.61,44.33,44.83,45.10,45.42,45.84,46.08,45.89,46.03,45.61,46.28,46.28];const rr=k.rsiSerie(c,14);
   ok(Math.abs(rr[14]-70.46)<0.1&&rr[13]==null,'RSI de Wilder correcto ('+rr[14].toFixed(2)+')');
   const M=k.macdSerie(Array.from({length:60},(_,i)=>100+i));ok(M.macd[24]==null&&M.macd[25]>0&&M.senal[33]!=null&&Math.abs(M.hist[59])<1e-9,'MACD 12/26/9 alineado');}
  ok(w.appBack()===true&&!d.getElementById('grafModal').classList.contains('open'),'atrás cierra la gráfica');
  click(d,'#activos [data-graf="SOL"] .info');await espera(40);click(d,'#grafOrden');await espera(20);
  ok(d.querySelector('.screen.active').id==='ordenes'&&d.getElementById('onSym').value==='SOL'&&d.getElementById('ordNuevaBox').open,'«Crear orden» desde la gráfica');
  click(d,'.nav [data-target="ia"]');await espera(30);click(d,'#opiniones [data-graf="ETH"] .info');await espera(40);
  ok(d.getElementById('grafTitulo').textContent==='ETH'&&G().querySelectorAll('svg').length===3,'gráfica desde las señales de la IA');click(d,'#grafCerrar');
  // ---- Semáforo
  click(d,'.nav [data-target="config"]');await espera(60);
  const fila=k=>d.querySelector('#semLuces [data-sem="'+k+'"]');
  ok(d.querySelectorAll('#semLuces .sem-fila').length===4,'semáforo con nube, ciclos, IA y exchange');
  ok(fila('nube').dataset.nivel==='verde'&&fila('ciclos').dataset.nivel==='verde'&&fila('exchange').dataset.nivel==='verde','nube, ciclos y exchange en verde');
  ok(fila('ia').dataset.nivel==='amarillo'&&/Prueba todos los modelos/.test(d.getElementById('semAyuda').textContent),'IA en amarillo (falló un modelo) con instrucciones');
  ok(/REVISAR/.test(d.getElementById('semPill').textContent),'resumen del semáforo');
  click(d,'#semArreglar');for(let i=0;i<40&&!/Vuelvo a revisar/.test(d.getElementById('semDiag').textContent);i++)await espera(30);
  const dg=d.getElementById('semDiag').textContent;
  ok(/✗ kilo-auto\/free/.test(dg)&&/queda como modelo principal/.test(dg),'buscar y corregir: prueba cada modelo y deja el que responde');
  ok(/◎ IA \(demo\)/.test(dg),'la IA explica el diagnóstico');
  click(d,'#modoBtn');await espera(10);click(d,'#mSi');await espera(10);
  d.getElementById('confReal').value='real';click(d,'#mSi');await espera(30);
  ok(w.__kumo.datos.config.modo==='real','dinero real tras doble confirmación con «REAL»');
  const BTC='bc1qd9j45f4t0jwyhjhqh2kvz2cr7k8xye460rr2y7',XMR='447gTj6Hg6gaAEAUmjqfhqDZr1PziUTvbT4LYLpmLVnTNVFK6cqeqPfh6P4neMKLWX5jDXAr94fWHacJwDvjmCzBBH8wPBt';
  ok(d.getElementById('dirBtc').textContent===BTC&&d.getElementById('dirXmr').textContent===XMR,'direcciones de donación exactas');
  ok([...d.querySelectorAll('#donar img')].every(i=>require('fs').existsSync(WWW+i.getAttribute('src'))),'logos y QR de donación existen en la APK');
  click(d,'[data-copiar="dirXmr"]');ok(copias[0]===XMR&&/copiada/.test(d.getElementById('toast').textContent),'copiar dirección Monero');
  click(d,'[data-billetera^="bitcoin:"]');ok(billeteras[0]==='bitcoin:'+BTC,'abre billetera Bitcoin');
  click(d,'[data-billetera^="monero:"]');ok(/No hay billetera de Monero/.test(d.getElementById('toast').textContent),'avisa si no hay billetera Monero');
  click(d,'#temaChips [data-tema="dia"]');ok(d.documentElement.dataset.tema==='dia','cambio de tema desde Config');
  ok(w.appBack()===true&&d.querySelector('.screen.active').id==='panel','botón atrás vuelve al panel');
  ok(errores.length===0,'sin errores JS: '+errores.join(' | '));
 }
 // ---------- 2) Asistente: crear la nube
 {
  const nacl=require('tweetnacl');const kp=nacl.box.keyPair();const pk=Buffer.from(kp.publicKey).toString('base64');
  const secretos={},llamadas=[],sinToken=[],git=[];let creado=false,despachos=[];
  const appUrl='https://kumo-bot.amigo.workers.dev';
  const fetchMock=(url,o={})=>{
    const m=(o.method||'GET');llamadas.push(m+' '+url);
    const u=new URL(url);const p=u.pathname;
    if(u.host==='api.github.com'){
      if(p==='/repos/tradiabot/kumo-bot/releases/latest')return R(200,{tag_name:'v9.9.9',body:'Novedades de prueba',html_url:'https://github.com/tradiabot/kumo-bot/releases/tag/v9.9.9',assets:[{name:'KumoBot-v9.9.9.apk',browser_download_url:'https://github.com/tradiabot/kumo-bot/releases/download/v9.9.9/KumoBot-v9.9.9.apk'}]});
      const auth=(o.headers||{}).Authorization||'';if(!/^Bearer [A-Za-z0-9_-]{3,}$/.test(auth)||/undefined|null/.test(auth)){sinToken.push(m+' '+p);return R(p.startsWith('/repos/amigo/')?404:401,{message:'Not Found'})}
      if(p==='/repos/tradiabot/kumo-bot'&&m==='GET')return R(200,{default_branch:'main'});
      if(p==='/repos/tradiabot/kumo-bot/git/trees/main')return R(200,{tree:[{path:'runner',type:'tree',sha:'d1'},{path:'runner/exchanges.py',type:'blob',mode:'100644',sha:'nuevo1'},{path:'worker/src/index.ts',type:'blob',mode:'100644',sha:'igual2'},{path:'README.md',type:'blob',mode:'100644',sha:'readme'}]});
      if(p==='/repos/tradiabot/kumo-bot/git/blobs/nuevo1')return R(200,{content:'cHJp\nbnQoMSk=',encoding:'base64'});
      if(p==='/repos/amigo/kumo-nube/git/ref/heads/main')return R(200,{object:{sha:'base1'}});
      if(p==='/repos/amigo/kumo-nube/git/blobs/v134')return R(200,{content:Buffer.from('1.3.4\n').toString('base64'),encoding:'base64'});
      if(p==='/repos/amigo/kumo-nube/git/trees/base1')return R(200,{tree:[...(nubeNueva?[{path:'runner/version.txt',type:'blob',sha:'v134'}]:[]),{path:'runner/exchanges.py',type:'blob',sha:'viejo1'},{path:'worker/src/index.ts',type:'blob',sha:'igual2'},{path:'kumo.json',type:'blob',sha:'k'}]});
      if(p==='/repos/amigo/kumo-nube/git/blobs'&&m==='POST'){git.push('blob:'+JSON.parse(o.body).content);return R(201,{sha:'blobN'})}
      if(p==='/repos/amigo/kumo-nube/git/trees'&&m==='POST'){const b=JSON.parse(o.body);git.push('tree:'+b.base_tree+':'+b.tree.map(x=>x.path+'='+x.sha).join(','));return R(201,{sha:'treeN'})}
      if(p==='/repos/amigo/kumo-nube/git/commits'&&m==='POST'){git.push('commit:'+JSON.parse(o.body).parents);return R(201,{sha:'comN'})}
      if(p==='/repos/amigo/kumo-nube/git/refs/heads/main'&&m==='PATCH'){git.push('ref:'+JSON.parse(o.body).sha);return R(200,{})}
      if(p==='/user')return R(200,{login:'amigo'},{'x-oauth-scopes':'repo, workflow'});
      if(p==='/repos/amigo/kumo-nube'&&m==='GET')return R(creado?200:404,creado?{default_branch:'main'}:{message:'Not Found'});
      if(p==='/repos/tradiabot/kumo-bot/generate'){creado=true;const b=JSON.parse(o.body);return R(b.private===true&&b.owner==='amigo'?201:400,{default_branch:'main'})}
      if(p.endsWith('/contents/.github/workflows/instalar.yml'))return R(200,{});
      if(p.endsWith('/actions/secrets/public-key'))return R(200,{key:pk,key_id:'k1'});
      if(p.includes('/actions/secrets/')&&m==='PUT'){const b=JSON.parse(o.body);const c=Buffer.from(b.encrypted_value,'base64');
        // abrir el sealed box como lo haría GitHub (libsodium)
        const epk=c.subarray(0,32),blake=require('blakejs');const nonce=blake.blake2b(Buffer.concat([epk,Buffer.from(kp.publicKey)]),null,24);
        const abierto=nacl.box.open(new Uint8Array(c.subarray(32)),nonce,new Uint8Array(epk),kp.secretKey);
        secretos[p.split('/').pop()]=abierto?Buffer.from(abierto).toString():'<<ilegible>>';return R(201,null)}
      if(p.includes('/actions/secrets/')&&m==='DELETE'){secretos[p.split('/').pop()]='<<borrado>>';return R(204,null)}
      if(p.endsWith('/dispatches')){despachos.push(p.split('/')[6]);return R(204,null)}
      if(p.endsWith('/instalar.yml/runs')){const enCurso=runsVistos++===0;return R(200,{workflow_runs:[{id:77,status:enCurso?'in_progress':'completed',conclusion:enCurso?null:'success',created_at:new Date().toISOString(),html_url:'https://github.com/x'}]})}
      if(p.endsWith('/ciclo.yml/runs')){const enCurso=cicloVistos++===0;return R(200,{workflow_runs:[{id:78,status:enCurso?'in_progress':'completed',conclusion:enCurso?null:'success',created_at:new Date().toISOString(),html_url:'https://github.com/x'}]})}
      if(p.endsWith('/actions/runs/78/jobs'))return R(200,{jobs:[{steps:[{name:'Preparar',status:'completed'},{name:'Ciclo de Kumo',status:'in_progress'},{name:'Fin',status:'queued'}]}]});
      if(p.endsWith('/actions/runs/77/jobs'))return R(200,{jobs:[{steps:[{name:'Revisar secretos',status:'completed'},{name:'Subdominio workers.dev',status:'completed'},{name:'Desplegar Worker',status:'in_progress'},{name:'Comprobar y guardar la dirección',status:'queued'}]}]});
      if(p.endsWith('/contents/kumo.json'))return R(200,{content:Buffer.from(JSON.stringify({url:appUrl})).toString('base64')});
    }
    if(url.startsWith(appUrl)){
      const tok=(o.headers||{}).Authorization;
      if(tok!=='Bearer '+secretos.KUMO_APP_TOKEN)return R(401,{error:'Token inválido'});
      if(p==='/api/estado')return R(200,{config:{modo:'simulacion',quote:'USD',objetivo:{}},ciclo:0,ultimo:{quote:'USDC',exchange:'hyperliquid',total:1000,real:{libre:0,estables:0,perps_usdc:25.5,saldos:{HYPE:1.25}}}});
      if(p==='/api/config')return R(200,{ok:true,config:{quote:JSON.parse(o.body||'{}').quote}});
    }
    return R(404,{message:'no mock '+url});
  };
  const abiertos=[];let runsVistos=0,cicloVistos=0,nubeNueva=false;
  const nativo=w=>({estado:()=>'{}',barras(){},abrirUrl(u){abiertos.push(u)},config(){},
    http(id,met,url,cab,cuerpo){const h=JSON.parse(cab);let st=200,dat={};
      if(url.includes('/accounts'))dat=h.Authorization==='Bearer cf-bueno'?{success:true,result:[{id:'acc123456789',name:'Cuenta de Amigo'}]}:{success:false,result:null};
      else if(url==='https://api.groq.com/openai/v1/models'){if(h.Authorization==='Bearer gsk_bueno')dat={data:[{id:'m1'},{id:'m2'}]};else{st=401;dat={error:'bad'}}}
      else if(url==='https://api.kilo.ai/api/gateway/models'){if(h.Authorization){st=400}else dat={data:[{id:'kilo-auto/free'},{id:'nvidia/nemotron-3-super-120b-a12b:free'}]}}
      else if(url==='https://generativelanguage.googleapis.com/v1beta/openai/models'){if(h.Authorization==='Bearer AIza-bueno')dat={data:[{id:'models/gemini-2.5-flash'},{id:'models/gemini-3.6-flash-lite'},{id:'models/gemini-3.6-flash'},{id:'models/text-embedding-004'}]};else{st=400;dat={error:'API key not valid'}}}
      else if(url==='https://ia.ejemplo.com/v1/models')dat={data:[{id:'modelo-a'},{id:'modelo-b'}]};
      else st=404;
      setTimeout(()=>w.kumoHttp(id,st,JSON.stringify(dat)),5)}});
  const {w,d,errores}=crear(fetchMock,nativo);
  await espera(30);
  click(d,'#tutoCerrar');w.__kumo.irPaso('inicio');click(d,'[data-paso="inicio"] [data-ir="gh"]');
  ok(d.getElementById('tuto').classList.contains('open')&&d.querySelector('.paso.activo').dataset.paso==='inicio','«Crear mi nube» exige ver el tutorial');
  for(let i=0;i<5;i++)click(d,'#tutoSig');d.getElementById('tutoOk').checked=true;d.getElementById('tutoOk').dispatchEvent(new w.Event('change'));click(d,'#tutoSig');
  ok(d.querySelector('.paso.activo').dataset.paso==='gh','tras el tutorial continúa al paso de GitHub');
  d.getElementById('ghToken').value='ghp_prueba';click(d,'#ghSig');await espera(600);
  ok(d.querySelector('.paso.activo').dataset.paso==='cf','GitHub validado → Cloudflare ('+d.getElementById('ghValida').textContent+')');
  ok(d.getElementById('cfMantener').classList.contains('oculto'),'nube nueva: sin botón «mantener Cloudflare»');
  d.getElementById('cfToken').value='cf-malo';click(d,'#cfSig');await espera(60);
  ok(/rechazó/.test(d.getElementById('cfValida').textContent),'token de Cloudflare inválido detectado');
  d.getElementById('cfToken').value='cf-bueno';click(d,'#cfSig');await espera(600);
  ok(d.querySelector('.paso.activo').dataset.paso==='ia','Cloudflare validado y cuenta detectada');
  const prov=v=>{d.getElementById('iaProv').value=v;d.getElementById('iaProv').dispatchEvent(new w.Event('change'))};
  ok(d.getElementById('iaProv').value==='kilo'&&d.getElementById('iaKeyL').classList.contains('oculto'),'IA: Kilo sin cuenta por defecto, sin campo de clave');
  ok(d.getElementById('iaProv').options.length>=6,'IA: varios proveedores gratis para elegir');
  prov('groq');ok(!d.getElementById('iaKeyL').classList.contains('oculto')&&/ABRIR GROQ/.test(d.getElementById('iaNota').textContent),'IA: Groq pide clave y da el enlace');
  click(d,'#iaSig');ok(/Pega tu clave/.test(d.getElementById('iaValida').textContent),'IA: Groq sin clave → avisa');
  d.getElementById('iaKey').value='gsk_malo';click(d,'#iaSig');await espera(60);
  ok(/Rechazó la clave/.test(d.getElementById('iaValida').textContent),'IA: clave de Groq inválida detectada');
  prov('otro');ok(!d.getElementById('iaUrlL').classList.contains('oculto')&&!d.getElementById('iaModeloL').classList.contains('oculto'),'IA: «Otro» pide URL y modelo');
  d.getElementById('iaUrl').value='https://ia.ejemplo.com/v1/';d.getElementById('iaModelo').value='modelo-x';d.getElementById('iaKey').value='';click(d,'#iaSig');await espera(60);
  ok(/no está en su lista.*modelo-a/.test(d.getElementById('iaValida').textContent),'IA: «Otro» avisa si el modelo no existe y sugiere otros');
  prov('kilo');click(d,'#iaSig');await espera(600);
  ok(d.querySelector('.paso.activo').dataset.paso==='ex','IA: Kilo validado sin clave ('+d.getElementById('iaValida').textContent+')');
  d.getElementById('exId').value='kraken';d.getElementById('exId').dispatchEvent(new w.Event('change'));
  ok(d.getElementById('exQuote').options.length===3,'monedas base de Kraken');
  click(d,'#exSig');ok(/Falta la API key/.test(d.getElementById('exValida').textContent),'pide claves del exchange');
  d.getElementById('exKey').value='kk';click(d,'#exSig');ok(/Falta el secret/.test(d.getElementById('exValida').textContent),'secret obligatorio, con explicación');
  d.getElementById('exSecret').value='kk';click(d,'#exSig');ok(/iguales/.test(d.getElementById('exValida').textContent),'detecta API key pegada como secret');
  ok(![...d.querySelectorAll('#exId option')].some(o=>/binance|bybit|okx|kucoin|bitget/.test(o.value)),'sin exchanges que bloquean EE. UU.');
  d.getElementById('exId').value='hyperliquid';d.getElementById('exId').dispatchEvent(new w.Event('change'));
  ok(/Dirección/.test(d.getElementById('exKeyT').textContent)&&/sin KYC|Sin KYC/.test(d.getElementById('exNota').textContent),'Hyperliquid sin KYC con campos de billetera');
  d.getElementById('exKey').value='0x123';d.getElementById('exSecret').value='abc';click(d,'#exSig');ok(/0x \+ 40/.test(d.getElementById('exValida').textContent),'valida formato de billetera');
  d.getElementById('exId').value='kraken';d.getElementById('exId').dispatchEvent(new w.Event('change'));d.getElementById('exKey').value='';d.getElementById('exSecret').value='';
  d.getElementById('exKey').value='kk';d.getElementById('exSecret').value='ss';d.getElementById('exQuote').value='USD';click(d,'#exSig');
  ok(d.querySelector('.paso.activo').dataset.paso==='resumen','resumen');
  ok(d.querySelectorAll('#resumen .badge.buy').length===4,'resumen con 4 OK');
  click(d,'#instalar');
  const pcts=[],pasosVistos=[];
  for(let i=0;i<80&&d.querySelector('.paso.activo').dataset.paso!=='fin';i++){pcts.push(parseInt(d.getElementById('instPct').textContent));pasosVistos.push([...d.querySelectorAll('#instLog div')].map(x=>x.textContent).join('|'));await espera(200)}
  ok(!d.getElementById('instProg').classList.contains('oculto'),'instalación: barra de progreso visible');
  ok(pcts.every((p,i)=>i===0||p>=pcts[i-1]),'instalación: el porcentaje nunca retrocede ('+[...new Set(pcts)].join('→')+')');
  ok(pcts.includes(58)&&pasosVistos.some(t=>/Desplegar Worker \(3\/4\)/.test(t)),'instalación: avanza según los pasos reales de GitHub Actions (2/4 → 58%)');
  ok(d.getElementById('instPct').textContent==='100%'&&d.getElementById('instBarra').style.width==='100%'&&d.getElementById('instProg').classList.contains('ok'),'instalación: termina en 100%');
  console.log('   log:',[...d.querySelectorAll('#instLog div')].map(x=>x.textContent).join(' | '));
  ok(d.querySelector('.paso.activo').dataset.paso==='fin','instalación completa → ¡NUBE ONLINE!');
  const S=w.__kumo.S;
  ok(sinToken.length===0,"todas las llamadas a GitHub llevan token: "+sinToken.join(", "));
  ok(S.url===appUrl&&S.token===secretos.KUMO_APP_TOKEN&&S.token.length===48,'app conectada con el token generado');
  ok(secretos.CLOUDFLARE_API_TOKEN==='cf-bueno'&&secretos.CLOUDFLARE_ACCOUNT_ID==='acc123456789','secretos de nube descifrables por GitHub');
  ok(secretos.IA_URL==='https://api.kilo.ai/api/gateway'&&/nemotron/.test(secretos.IA_MODELOS)&&secretos.IA_CLAVE==='<<borrado>>'&&secretos.GROQ_API_KEY==='<<borrado>>','secretos de IA: Kilo sin clave y Groq viejo borrado');
  ok(secretos.EXCHANGE_ID==='kraken'&&secretos.EXCHANGE_API_KEY==='kk'&&secretos.EXCHANGE_SECRET==='ss'&&secretos.EXCHANGE_PASSWORD==='<<borrado>>','secretos del exchange');
  ok(secretos.KUMO_RUNNER_TOKEN&&secretos.KUMO_RUNNER_TOKEN!==S.token,'token del runner distinto');
  ok(despachos.join()==='instalar.yml,ciclo.yml','lanzó instalar y luego el primer ciclo');
  ok(!JSON.stringify(S).includes('cf-bueno')&&!JSON.stringify(S).includes('gsk_')&&!JSON.stringify(S).includes('kilo.ai')&&!JSON.stringify(S).includes('"kk"'),'claves de Cloudflare/Groq/exchange NO quedan en el teléfono');
  ok(d.getElementById('exKey').value===''&&d.getElementById('cfToken').value==='','campos de claves vaciados');
  click(d,'#finEntrar');await espera(50);
  ok(d.getElementById('conn').textContent.includes('EN LÍNEA'),'app en línea con la nube nueva');
  await espera(100);const sr=d.getElementById('saldoReal');
  ok(!sr.classList.contains('oculto')&&/Saldo real en hyperliquid/.test(sr.textContent)&&/25,5 USDC en Perps/.test(sr.textContent)&&/HYPE 1,25/.test(sr.textContent)&&/simulación/.test(sr.textContent),'panel: saldo real del exchange visible en simulación, con aviso de Perps ('+sr.textContent.slice(0,80)+')');
  {const K=w.__kumo,ea=K.datos.estado;ok(K.S.clavesTs>0,'guarda cuándo se cambiaron las claves');
   K.datos.estado={...ea,actualizado:K.S.clavesTs-3600000,ultimo:{ok:false,exchange:'cryptocom_app',errores:['ErrorExchange: Crypto.com App: claves rechazadas (401)']}};
   K.pintarEstado();const av=d.getElementById('erroresAviso');
   ok(/Crypto\.com App/.test(av.textContent)&&/antes de cambiar tus claves/.test(av.textContent),'error de un ciclo anterior al cambio de claves: se marca como viejo');
   ok(/CRYPTOCOM APP/.test(d.getElementById('topEx').textContent),'la cabecera dice con qué exchange falló ese ciclo');
   K.datos.estado={...ea,actualizado:Date.now(),ultimo:{ok:false,exchange:'hyperliquid',errores:['ErrorExchange: x']}};K.pintarEstado();
   ok(!/antes de cambiar/.test(av.textContent),'error de un ciclo nuevo: sin esa nota');
   K.datos.estado=ea;K.pintarEstado();}
  {const tx=d.getElementById('cicloTxt'),pc=d.getElementById('cicloPct');
   ok(/Próximo ciclo en \d+:\d\d/.test(tx.textContent)&&/^\d+:\d\d$/.test(d.getElementById('proxCiclo').textContent)&&/^\d+%$/.test(pc.textContent),'barra del ciclo en reposo: '+tx.textContent+' '+pc.textContent);
   const n=despachos.length;click(d,'#cicloAhora');
   let vio='';for(let i=0;i<40&&!/terminado/.test(tx.textContent);i++){await espera(250);if(/Ciclo… en curso: Ciclo de Kumo \(2\/3\)/.test(tx.textContent))vio=pc.textContent}
   ok(despachos[n]==='ciclo.yml','CICLO AHORA lanza ciclo.yml');
   ok(vio==='35%','la barra sigue los pasos del ciclo en GitHub ('+vio+')');
   ok(/Ciclo terminado/.test(tx.textContent)&&pc.textContent==='100%'&&d.getElementById('cicloProg').classList.contains('ok'),'ciclo terminado: barra al 100% ('+tx.textContent+')');}
  await espera(300);
  ok(!d.getElementById('updBanda').classList.contains('oculto')&&/v9\.9\.9/.test(d.getElementById('updBanda').textContent),'banda de nueva versión visible');
  ok(d.getElementById('modal').classList.contains('open')&&/v9\.9\.9/.test(d.getElementById('mTitulo').textContent)&&/Novedades de prueba/.test(d.getElementById('mExtra').textContent),'aviso de actualización al entrar a la app (no durante el asistente)');
  click(d,'#mSi');await espera(20);
  ok(abiertos.some(u=>/KumoBot-v9\.9\.9\.apk$/.test(u)),'DESCARGAR abre la APK nueva');
  ok(w.__kumo.S.updVisto==='v9.9.9','no vuelve a saltar el mismo aviso');
  click(d,'#buscarUpd');await espera(50);
  ok(d.getElementById('modal').classList.contains('open'),'BUSCAR ACTUALIZACIÓN vuelve a ofrecerla');click(d,'#mNo');
  await espera(20);click(d,'#actualizarNube');await espera(20);click(d,'#mSi');
  for(let i=0;i<30&&!git.some(x=>x.startsWith('ref:'));i++)await espera(50);await espera(100);
  ok(git.join('|')==='blob:cHJpbnQoMSk=|tree:base1:runner/exchanges.py=blobN|commit:base1|ref:comN','ACTUALIZAR NUBE copia solo lo que cambió: '+git.join('|'));
  ok(despachos.slice(-1)[0]==='instalar.yml','y vuelve a desplegar la nube');
  ok(sinToken.length===0,'actualizar nube con token');
  // ---- Una nube con código más nuevo que la plantilla no se degrada
  git.length=0;nubeNueva=true;click(d,'#actualizarNube');await espera(20);click(d,'#mSi');
  for(let i=0;i<40&&!/más nuevo/.test(d.body.textContent);i++)await espera(50);
  ok(git.length===0&&/más nuevo que la plantilla/.test(d.body.textContent),'ACTUALIZAR NUBE no degrada una nube con código más nuevo');
  nubeNueva=false;await espera(300);
  // ---- Cambiar claves: mismo GitHub y Cloudflare, otra IA, exchange igual; trae el código nuevo y reinstala
  git.length=0;for(const k in secretos)delete secretos[k];
  click(d,'#cambiarClaves');await espera(20);
  click(d,'#ghSig');await espera(600);
  ok(d.querySelector('.paso.activo').dataset.paso==='cf'&&!d.getElementById('cfMantener').classList.contains('oculto'),'cambiar claves: también pasa por Cloudflare, con «mantener»');
  click(d,'#cfMantener');ok(d.querySelector('.paso.activo').dataset.paso==='ia','cambiar claves: Cloudflare se mantiene');
  prov('google');d.getElementById('iaKey').value='AIza-malo';click(d,'#iaSig');await espera(60);
  ok(/respondió 400/.test(d.getElementById('iaValida').textContent),'IA: clave de Google inválida detectada');
  d.getElementById('iaKey').value='AIza-bueno';click(d,'#iaSig');await espera(600);
  ok(d.querySelector('.paso.activo').dataset.paso==='ex'&&!d.getElementById('exMantener').classList.contains('oculto'),'cambiar claves: Gemini validado → exchange con «mantener»');
  click(d,'#exMantener');
  ok(d.querySelector('.paso.activo').dataset.paso==='resumen'&&(d.getElementById('resumen').textContent.match(/sin cambios/g)||[]).length===2&&/REINSTALAR/.test(d.getElementById('instalar').textContent),'resumen: Cloudflare y exchange sin cambios, botón reinstalar');
  const exAntes=w.__kumo.S.exchange,desp0=despachos.length;
  click(d,'#instalar');
  for(let i=0;i<60&&d.querySelector('.paso.activo').dataset.paso!=='fin';i++)await espera(200);
  const logCl=[...d.querySelectorAll('#instLog div')].map(x=>x.textContent).join(' | ');console.log('   log:',logCl);
  ok(d.querySelector('.paso.activo').dataset.paso==='fin','cambiar claves: reinstalación completa');
  ok(/Código actualizado \(1 archivo\)/.test(logCl)&&git.join('|').endsWith('ref:comN'),'cambiar claves: trae el código nuevo antes de reinstalar');
  ok(secretos.IA_URL==='https://generativelanguage.googleapis.com/v1beta/openai'&&secretos.IA_CLAVE==='AIza-bueno','cambiar claves: IA de Google guardada');
  ok(secretos.IA_MODELOS==='gemini-3.6-flash,gemini-2.5-flash','Gemini: usa los modelos que Google lista hoy ('+secretos.IA_MODELOS+')');
  ok(!('EXCHANGE_ID' in secretos)&&!('EXCHANGE_SECRET' in secretos)&&!('CLOUDFLARE_API_TOKEN' in secretos)&&w.__kumo.S.exchange===exAntes,'cambiar claves: no toca el exchange ni Cloudflare');
  ok(despachos.slice(desp0).join()==='instalar.yml,ciclo.yml','cambiar claves: reinstala y lanza un ciclo');
  ok(errores.length===0,'sin errores JS: '+errores.join(' | '));
 }
 // ---------- 3) Semáforo con fallas reales: ciclos apagados, exchange sin claves, IA caída
 {
  const llamadas=[],ahora=Date.now();let habilitado=false;
  const fetchMock=(url,o={})=>{
    const m=o.method||'GET',u=new URL(url),p=u.pathname;llamadas.push(m+' '+p);
    if(u.host==='api.github.com'){
      if(p.endsWith('/releases/latest'))return R(404,{});
      if(p==='/repos/amigo/kumo-nube/actions/workflows/ciclo.yml')return R(200,{state:habilitado?'active':'disabled_inactivity'});
      if(p==='/repos/amigo/kumo-nube/actions/workflows/ciclo.yml/runs')return R(200,{workflow_runs:[]});
      if(p==='/repos/amigo/kumo-nube/actions/workflows/ciclo.yml/enable'&&m==='PUT'){habilitado=true;return R(204,null)}
      if(p.endsWith('/dispatches'))return R(204,null);
      return R(404,{});
    }
    const cuerpo=o.body?JSON.parse(o.body):null;
    if(p==='/api/estado')return R(200,{version:'1.4.0',config:{modo:'real',ia:'veto',quote:'USDC',objetivo:{BTC:50,POL:10}},ciclo:51,actualizado:ahora-4*3600e3,historial:[],ultimo:{ok:true,exchange:'hyperliquid',quote:'USDC',activos:[],notas:['POL: sin datos de mercado'],errores:[]}});
    if(p==='/api/semaforo')return R(200,{version:'1.4.0',ciclo:51,actualizado:ahora-4*3600e3,ok:true,errores:[],exchange:'hyperliquid',modo:'real',pausado:false,real:{error:'HTTP 401: invalid API key'},libre:10.5,monto_min:11,quote:'USDC',ia:{modo:'veto',proveedor:'kilo.ai',modelos:['a','b'],ultimas:[]}});
    if(p==='/api/ia/probar')return R(200,{ok:false,codigo:'caida',error:'kilo.ai HTTP 503 con b',pruebas:cuerpo&&cuerpo.todos?[{modelo:'a',ok:false,error:'HTTP 503'},{modelo:'b',ok:false,error:'HTTP 503'}]:[]});
    if(p==='/api/ia/diagnosticar')return R(500,{error:'no debería llamarse'});
    return R(200,{});
  };
  const {w,d,errores}=crear(fetchMock,null,{onb:true,tuto:true,url:'https://kumo-bot.amigo.workers.dev',token:'t0k',gh:{owner:'amigo',repo:'kumo-nube',rama:'main',token:'ghp_prueba'}});
  await espera(80);click(d,'.nav [data-target="config"]');for(let i=0;i<30&&!d.querySelector('#semLuces [data-sem="ia"][data-nivel="rojo"]');i++)await espera(30);
  const fila=k=>d.querySelector('#semLuces [data-sem="'+k+'"]'),A=()=>d.getElementById('semAyuda').textContent;
  ok(fila('nube').dataset.nivel==='amarillo'&&/v1\.4\.0/.test(fila('nube').textContent)&&/Actualizar el código/.test(A()),'nube vieja en amarillo con botón para actualizar');
  ok(fila('ciclos').dataset.nivel==='rojo'&&/60 días/.test(A()),'ciclos apagados por GitHub en rojo con explicación');
  ok(fila('exchange').dataset.nivel==='rojo'&&/lista de IPs/.test(A()),'exchange sin claves en rojo con instrucciones');
  ok(fila('ia').dataset.nivel==='rojo'&&/HAY FALLAS/.test(d.getElementById('semPill').textContent),'IA caída en rojo');
  llamadas.length=0;click(d,'#semArreglar');for(let i=0;i<60&&!/Vuelvo a revisar/.test(d.getElementById('semDiag').textContent);i++)await espera(30);
  const dg=d.getElementById('semDiag').textContent;
  ok(llamadas.includes('PUT /repos/amigo/kumo-nube/actions/workflows/ciclo.yml/enable')&&llamadas.includes('POST /repos/amigo/kumo-nube/actions/workflows/ciclo.yml/dispatches'),'autocorrección: reactiva los ciclos y lanza uno');
  ok(/Ciclos automáticos reactivados/.test(dg)&&/Ciclo lanzado/.test(dg),'el registro dice qué arregló');
  ok(/La IA no está disponible/.test(dg)&&!llamadas.includes('POST /api/ia/diagnosticar'),'sin IA: solo arreglos seguros, no le pregunta');
  ok(!llamadas.some(x=>/POST \/api\/config/.test(x)),'nunca cambia tu configuración sin preguntar');
  ok(errores.length===0,'sin errores JS: '+errores.join(' | '));
 }
 console.log(fallos?`\n${fallos} FALLOS`:'\nTODO OK');process.exit(fallos?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
