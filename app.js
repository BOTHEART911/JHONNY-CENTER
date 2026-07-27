/* ============================================================
   JHONNY CENTER — app.js  (call center · 17/07/2026)
   ------------------------------------------------------------
   Se entra SOLO con PIN (4 dígitos, hoja USUARIOS_CALL). Lo que ve cada
   quien lo decide la app privada: Configuración → Call Center define el
   día, la franja horaria y los líderes que le tocan. Fuera de esa franja
   el PIN no abre nada.
   El PIN queda guardado en el equipo (como la sesión de las otras apps),
   pero NO es la autorización: viaja en cada llamada y el CORE revalida
   PIN + turno en todas. Si el turno se vence con la app abierta, la
   siguiente acción lo dice.
   Las tarjetas son las de "Mis referidos" de la app pública (misma
   lógica, mismos colores, mismos valores) SIN editar ni nuevo referido,
   y con un botón Acción que guarda Asistencia/Intención en PRINCIPAL.
   ============================================================ */

/* URL del Web App del backend JHONNY CORE (/exec) — la MISMA de las otras apps */
const API_URL = 'https://script.google.com/macros/s/AKfycbw9CZ9ra6q1KI88M3U9IsYP861JOCFD4-xrV1b0UFYhL1amBjAqTTmtNXi42vwLI_h6Hw/exec';

const APP_ICON   = 'https://res.cloudinary.com/dqqeavica/image/upload/v1753538807/JHONNY_PERDOMO_dn3dah.png';
const APP_BANNER = 'https://res.cloudinary.com/dqqeavica/image/upload/v1753538919/BANNER_JHONNY_e0yw7m.png';

/* ---------- Utilidades ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const app = $('#app');
const layer = $('#layer');
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const onlyDig = s => String(s || '').replace(/\D/g, '');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const esMovil = () => /android|iphone|ipad|ipod|windows phone/i.test(navigator.userAgent || '');

function toast(msg, kind = '') { const t = h(`<div class="toast ${kind}">${esc(msg)}</div>`); layer.appendChild(t); setTimeout(() => t.remove(), 3600); }
function hideSplash() { const s = $('#splash'); if (s && !s.classList.contains('hide')) { s.classList.add('hide'); setTimeout(() => s.remove(), 520); } }
function iniciales(n) { const p = String(n || '').trim().split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); }
function saving(btn, on) { if (!btn) return; btn.disabled = on; btn.dataset.txt = btn.dataset.txt || btn.innerHTML; btn.innerHTML = on ? `<span class="spinner"></span>` : btn.dataset.txt; }

/* ---------- Íconos (los mismos de la app pública) ---------- */
const I = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
};

/* ---------- Cliente API ---------- */
let _apiActivas = 0;
function loaderOn() { _apiActivas++; const b = $('#ios-loader'); if (b) b.classList.add('active'); }
function loaderOff() { _apiActivas = Math.max(0, _apiActivas - 1); if (_apiActivas === 0) { const b = $('#ios-loader'); if (b) b.classList.remove('active'); } }
async function api(action, params = {}, opts = {}) {
  if (!opts.silencio) loaderOn();
  try {
    /* Todo va por POST: el PIN no tiene por qué quedar en la barra de
       direcciones ni en los logs de acceso del Web App. */
    const res = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // evita el preflight de CORS
      body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error del servidor');
    return json.data;
  } finally { if (!opts.silencio) loaderOff(); }
}

/* ---------- Sesión (solo el PIN, en este equipo) ---------- */
const PIN_KEY = nsKey('jpCenterPin');
let PIN = '';
let ME = null;      // { id, nombre, plantilla }
let TURNO = null;   // { dia, inicio, fin }
let TARJETAS = [];
let OPC = { asistencia: [], intencion: [] };
let OBS = null;     // observación ya guardada hoy
let VARS = [];

function pinLeer() { try { return localStorage.getItem(PIN_KEY) || ''; } catch (e) { return ''; } }
function pinGuardar(p) { try { localStorage.setItem(PIN_KEY, p); } catch (e) {} PIN = p; }
function pinBorrar() { try { localStorage.removeItem(PIN_KEY); } catch (e) {} PIN = ''; ME = null; TURNO = null; TARJETAS = []; }

/* ============================================================
   PWA: INSTALACIÓN (mismo patrón de las demás apps)
   ============================================================ */
let deferredPrompt = null;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: installed)').matches || window.navigator.standalone === true;
const isIOS = () => /(iphone|ipad|ipod)/i.test(navigator.userAgent || '');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (location.hash === '#/instalar') updateInstallSection(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('¡App instalada!', 'ok'); });

function updateInstallSection() {
  const and = $('#install-android'), ios = $('#install-ios'); if (!and || !ios) return;
  and.classList.add('hidden'); ios.classList.add('hidden');
  if (isIOS()) { ios.classList.remove('hidden'); return; }
  and.classList.remove('hidden');
  const b = $('#btn-install'), man = $('#install-manual');
  if (deferredPrompt) { if (b) b.style.display = ''; if (man) man.classList.add('hidden'); }
  else { if (b) b.style.display = 'none'; if (man) man.classList.remove('hidden'); }
}

/* ============================================================
   VERSIÓN + AUTO-UPDATE (lee version.js por texto)
   ============================================================ */
let APP_VERSION_LOADED = '', __verInFlight = false;
function paintVersion(v) { $$('.app-version-line').forEach(el => el.textContent = 'Versión ' + v); }
async function checkVersion() {
  if (__verInFlight) return; __verInFlight = true;
  try {
    const r = await fetch('./version.js?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const raw = await r.text();
    const m = raw.match(/version['"]?\s*[:=]\s*['"]([^'"]+)['"]/i) || raw.match(/(\d{4}\.\d{2}\.\d{2}\.\d+|\d+\.\d+(?:\.\d+)?)/);
    const v = m ? String(m[1]).trim() : '';
    if (!v) return;
    if (!APP_VERSION_LOADED) { APP_VERSION_LOADED = v; paintVersion(v); return; }
    if (v !== APP_VERSION_LOADED) {
      /* No se recarga con un modal abierto: se perdería lo que estén
         escribiendo (la observación del día, sobre todo). */
      if (document.body.classList.contains('sheet-open')) return;
      try { const ks = await caches.keys(); await Promise.all(ks.filter(nsCacheMia).map(k => caches.delete(k))); } catch (e) {}
      location.reload();
    }
  } finally { __verInFlight = false; }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

/* ---------- Constructores ---------- */
function footBrand() { return `<img class="brand-banner" src="${APP_BANNER}" alt="" onerror="this.style.display='none'" /><p class="app-version-line">Versión —</p>`; }

function openSheet(html) {
  closeLayer();
  const ov = h(`<div class="scrim"></div>`);
  const sh = h(`<div class="sheet">${html}</div>`);
  layer.appendChild(ov); layer.appendChild(sh);
  document.body.classList.add('sheet-open');
  ov.onclick = closeLayer;
  $$('[data-close]', sh).forEach(b => b.onclick = closeLayer);
  return sh;
}
function closeLayer() {
  $$('.scrim, .sheet', layer).forEach(el => el.remove());
  document.body.classList.remove('sheet-open');
}

/* ============================================================
   RÚTER
   ============================================================ */
function go(route) { location.hash = '#/' + route; }
window.addEventListener('hashchange', render);
function render() {
  const route = (location.hash.replace(/^#\//, '') || '').split('?')[0];
  if (route === 'instalar') return viewInstalar();
  if (!ME) { const m = LOGIN_MSG; LOGIN_MSG = ''; return viewLogin(m); }
  return viewTarjetas();
}

/* ============================================================
   VISTA INSTALAR (gate)
   ============================================================ */
function viewInstalar() {
  app.innerHTML = `
    <div class="login-wrap"><div class="login-card">
      <img class="login-logo" src="${APP_ICON}" alt="Jhonny Perdomo" />
      <h1 class="login-title">Call Center</h1>
      <p class="login-sub">Instala la aplicación: llamar y escribir por WhatsApp funciona mucho mejor como app instalada que dentro del navegador.</p>

      <div id="install-android" class="hidden" style="margin-top:16px;">
        <button id="btn-install" class="btn btn-primary btn-block" style="display:none;">📲 Instalar aplicación</button>
        <div id="install-manual" class="hidden ios-steps-wrap">
          <p class="small" style="text-align:left;color:var(--muted);">Para instalarla en tu equipo:</p>
          <ol class="ios-steps">
            <li>Abre el menú <b>⋮</b> del navegador (arriba a la derecha).</li>
            <li>Elige <b>“Instalar aplicación”</b> o <b>“Añadir a la pantalla de inicio”</b>.</li>
            <li>Confirma con <b>“Instalar”</b>.</li>
          </ol>
        </div>
        <button id="btn-cont-web" class="btn btn-ghost btn-block" style="margin-top:10px;">🌐 Continuar en el navegador</button>
      </div>
      <div id="install-ios" class="hidden" style="margin-top:16px;">
        <p class="small" style="text-align:left;color:var(--muted);">En tu iPhone o iPad:</p>
        <ol class="ios-steps"><li>Pulsa <b>Compartir</b> en Safari.</li><li>Elige <b>“Añadir a pantalla de inicio”</b>.</li><li>Pulsa <b>“Añadir”</b>.</li></ol>
        <button id="btn-cont-web-ios" class="btn btn-ghost btn-block" style="margin-top:8px;">🌐 Continuar en el navegador</button>
      </div>

      ${footBrand()}
    </div></div>`;
  app.classList.remove('wide');
  app.hidden = false; hideSplash(); paintVersion(APP_VERSION_LOADED || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));
  updateInstallSection();
  const cont = () => { sessionStorage.setItem(nsKey('continuedWeb'), '1'); go('login'); };
  const bi = $('#btn-install');
  if (bi) bi.onclick = async () => {
    if (!deferredPrompt) { toast('La instalación aún no está disponible. Usa el menú del navegador.'); return; }
    const dp = deferredPrompt; dp.prompt(); try { await dp.userChoice; } catch (e) {} deferredPrompt = null; updateInstallSection();
  };
  const cw = $('#btn-cont-web'); if (cw) cw.onclick = cont;
  const cwi = $('#btn-cont-web-ios'); if (cwi) cwi.onclick = cont;
}

/* ============================================================
   VISTA LOGIN — PIN y nada más
   ============================================================ */
function viewLogin(msg) {
  app.innerHTML = `
    <div class="login-wrap"><div class="login-card">
      <img class="login-logo" src="${APP_ICON}" alt="Jhonny Perdomo" />
      <h1 class="login-title">Call Center</h1>
      <p class="login-sub">Escribe tu PIN para entrar.</p>
      ${msg ? `<p class="login-msg">${esc(msg)}</p>` : ''}
      <div class="stack" style="margin-top:14px;">
        <label class="field"><span>PIN</span>
          <input class="input pin-input" id="lg-pin" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••" />
        </label>
        <button class="btn btn-primary btn-block" id="lg-go">Entrar</button>
      </div>
      ${footBrand()}
    </div></div>`;
  app.classList.remove('wide');
  app.hidden = false; hideSplash(); paintVersion(APP_VERSION_LOADED || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''));

  const inp = $('#lg-pin');
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/\D/g, '').slice(0, 4);
    if (inp.value.length === 4) $('#lg-go').click();   // 4 dígitos = entrar, sin pulsar nada
  });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('#lg-go').click(); });
  setTimeout(() => inp.focus(), 150);

  $('#lg-go').onclick = async e => {
    const p = onlyDig(inp.value);
    if (p.length !== 4) return toast('El PIN es de 4 dígitos', 'err');
    saving(e.currentTarget, true);
    try {
      const r = await api('center.login', { pin: p });
      saving(e.currentTarget, false);
      if (!r.ok) { inp.value = ''; return toast(r.msg || 'PIN incorrecto', 'err'); }
      pinGuardar(p); ME = r.user; TURNO = r.turno; VARS = r.vars || [];
      if (location.hash === '#/tarjetas') render(); else go('tarjetas');
    } catch (err) { saving(e.currentTarget, false); toast(String(err.message || 'Error de conexión'), 'err'); }
  };
}

/* Cuando el servidor tumba la sesión (turno vencido, PIN borrado…).
   El motivo se guarda aparte: al cambiar el hash se repinta el login y, sin
   esto, el mensaje se perdía y el usuario no sabía por qué lo sacaron. */
let LOGIN_MSG = '';
function salir(msg) {
  pinBorrar(); LOGIN_MSG = msg || '';
  if (location.hash === '#/login') { const m = LOGIN_MSG; LOGIN_MSG = ''; return viewLogin(m); }
  location.hash = '#/login';
}

/* ============================================================
   VISTA TARJETAS
   ============================================================ */
function conEstado(t) { return !!(t.asistencia || t.intencion); }

async function viewTarjetas() {
  app.innerHTML = `${appbar()}<div class="pad stack" id="ct-body"><div class="loadbox"><span class="spinner spinner-brand"></span><p class="muted small">Cargando tu listado…</p></div></div>`;
  app.classList.add('wide');   // el listado sí aprovecha la pantalla del PC
  app.hidden = false; hideSplash(); bindAppbar();
  try {
    const r = await api('center.tarjetas', { pin: PIN });
    if (!r.ok) return salir(r.msg || 'Vuelve a entrar');
    ME = r.user; TURNO = r.turno; TARJETAS = r.tarjetas; OPC = r.opciones; OBS = r.observacion; VARS = r.vars || [];
    pintarTarjetas();
  } catch (e) { salir(String(e.message || 'Error de conexión')); }
}

function appbar() {
  return `<div class="appbar">
    <img class="mark-img" src="${APP_ICON}" alt="" />
    <div class="who"><b>${esc((ME && ME.nombre) || 'Call Center')}</b><span>${TURNO ? esc(TURNO.dia + ' · ' + TURNO.inicio + ' a ' + TURNO.fin) : ''}</span></div>
    <button class="ab-btn" id="ab-cfg" title="Configuración">${I.gear}</button>
    <button class="ab-btn" id="ab-out" title="Salir">${I.logout}</button>
  </div>`;
}
function bindAppbar() {
  const c = $('#ab-cfg'); if (c) c.onclick = () => sheetConfig();
  const o = $('#ab-out'); if (o) o.onclick = () => salir();
}

function pintarTarjetas() {
  const total = TARJETAS.length;
  const hechas = TARJETAS.filter(conEstado).length;
  const listo = total > 0 && hechas === total;

  const head = `<div class="ct-head">
      <input class="input" id="ct-q" placeholder="Buscar por nombre o documento…" autocomplete="off" />
    </div>
    <div class="ct-prog">
      <div class="ct-prog-t"><b>${hechas}</b> de <b>${total}</b> con estado</div>
      <div class="ct-bar"><i style="width:${total ? Math.round(hechas * 100 / total) : 0}%"></i></div>
    </div>`;

  const cards = total ? `<div class="ref-grid" id="ct-list">${TARJETAS.map(cardHtml).join('')}</div>`
    : `<div class="card pad center"><p class="muted">Hoy no tienes tarjetas asignadas. Habla con el equipo.</p></div>`;

  $('#ct-body').innerHTML = head + cards + cierreHtml(listo, total, hechas);
  bindCards();
  bindCierre(listo);

  $('#ct-q').addEventListener('input', e => {
    const q = norm(e.target.value);
    $$('#ct-list .rcard').forEach(c => { c.style.display = norm(c.dataset.search).includes(q) ? '' : 'none'; });
  });
}

function badgeAsis(v) { const m = { 'Confirmada': 'ok', 'No puede': 'no', 'Fuera de Flandes': 'warn', 'No filial': 'no', 'No contactado': 'mut' }; return m[v] || 'mut'; }
function badgeInten(v) { const m = { 'Firme con el voto': 'ok', 'No vota con nosotros': 'no', 'No está seguro(a)': 'warn', 'No sabe votar': 'warn', 'No contactado': 'mut' }; return m[v] || 'mut'; }
function muniClase(m) { return norm(m) === 'flandes' ? 'muni-flandes' : (m ? 'muni-otro' : ''); }

function cardHtml(t) {
  const asis = t.asistencia || 'No contactado';
  const inten = t.intencion || 'No contactado';
  const lugar = [t.residencia, t.municipio].filter(Boolean).join(' · ');
  return `<div class="rcard ${muniClase(t.municipio)}${conEstado(t) ? ' rcard-ok' : ''}" data-doc="${esc(t.documento)}" data-search="${esc(t.nombre + ' ' + t.documento)}">
    <div class="rcard-top">
      <div class="rc-av">${esc(iniciales(t.nombre))}</div>
      <div class="rc-id"><b>${esc(t.nombre)}</b><span>CC ${esc(t.documento)}${lugar ? ' · ' + esc(lugar) : ''}</span></div>
    </div>
    ${t.lider ? `<p class="rc-lider">Líder: <b>${esc(t.lider)}</b></p>` : '<p class="rc-lider muted">Sin líder</p>'}
    <div class="rc-badges">
      <span class="rc-badge ${badgeAsis(asis)}">🏷 ${esc(asis)}</span>
      <span class="rc-badge ${badgeInten(inten)}">🗳 ${esc(inten)}</span>
    </div>
    <div class="rc-actions">
      <button class="rc-btn" data-act="accion">✅ Acción</button>
      ${t.contacto ? `<button class="rc-btn wa" data-act="wa" title="WhatsApp">${I.wa}</button>` : ''}
      ${t.contacto && esMovil() ? `<button class="rc-btn tel" data-act="tel" title="Llamar">${I.phone}</button>` : ''}
    </div>
  </div>`;
}

function bindCards() {
  $$('#ct-list .rcard').forEach(card => {
    const t = TARJETAS.filter(x => x.documento === card.dataset.doc)[0];
    if (!t) return;
    card.querySelector('[data-act="accion"]').onclick = () => sheetAccion(t, card);
    const wa = card.querySelector('[data-act="wa"]'); if (wa) wa.onclick = () => abrirWa(t);
    const tel = card.querySelector('[data-act="tel"]'); if (tel) tel.onclick = () => window.open('tel:' + onlyDig(t.contacto), '_self');
  });
}

/* Repinta UNA tarjeta (no toda la lista: se perdería el filtro escrito) */
function repintarCard(t) {
  const card = $(`#ct-list .rcard[data-doc="${t.documento}"]`);
  if (!card) return;
  const nueva = h(cardHtml(t));
  card.replaceWith(nueva);
  bindCards();
  const total = TARJETAS.length, hechas = TARJETAS.filter(conEstado).length;
  const p = $('.ct-prog-t'); if (p) p.innerHTML = `<b>${hechas}</b> de <b>${total}</b> con estado`;
  const b = $('.ct-bar i'); if (b) b.style.width = (total ? Math.round(hechas * 100 / total) : 0) + '%';
  const listo = total > 0 && hechas === total;
  const c = $('#ct-cierre');
  if (c) { c.outerHTML = cierreHtml(listo, total, hechas); bindCierre(listo); }
}

/* ============================================================
   MODAL ACCIÓN — Asistencia y/o Intención (una opción por bloque)
   ============================================================ */
function sheetAccion(t, card) {
  const bloque = (campo, titulo, opts, actual) => `
    <div class="ac-block">
      <h3 class="ac-t">${titulo}</h3>
      <div class="stack">${opts.map((o, i) => `
        <label class="check ac-chk"><input type="radio" name="${campo}" value="${esc(o)}" ${norm(o) === norm(actual) ? 'checked' : ''} /><span>${esc(o)}</span></label>`).join('')}</div>
    </div>`;

  openSheet(`<div class="grip"></div>
    <h2 class="h2">Acción</h2>
    <p class="muted small">${esc(t.nombre)} · CC ${esc(t.documento)}</p>
    <div class="ac-wrap">
      ${bloque('asis', '🏷 Asistencia', OPC.asistencia, t.asistencia)}
      ${bloque('inten', '🗳 Intención', OPC.intencion, t.intencion)}
    </div>
    <div class="stack" style="margin-top:14px;">
      <button class="btn btn-primary btn-block" id="ac-save">Guardar</button>
      <button class="btn btn-quiet btn-block" data-close>Cerrar</button>
    </div>`);

  /* Un radio marcado no se puede desmarcar: sin esto, quien se equivoque de
     bloque no tiene forma de dejarlo como estaba. */
  $$('.ac-chk input').forEach(r => {
    r.addEventListener('click', function () {
      if (this.dataset.on === '1') { this.checked = false; this.dataset.on = ''; }
      else { $$('input[name="' + this.name + '"]').forEach(o => o.dataset.on = ''); this.dataset.on = '1'; }
    });
    if (r.checked) r.dataset.on = '1';
  });

  $('#ac-save').onclick = async e => {
    const asis = ($('input[name="asis"]:checked') || {}).value || '';
    const inten = ($('input[name="inten"]:checked') || {}).value || '';
    if (!asis && !inten) return toast('Marca al menos una opción', 'err');
    saving(e.currentTarget, true);
    try {
      const r = await api('center.marcar', { pin: PIN, refDoc: t.documento, asistencia: asis, intencion: inten });
      saving(e.currentTarget, false);
      if (!r.ok) return toast(r.msg || 'No se pudo guardar', 'err');
      Object.assign(t, r.tarjeta);
      closeLayer(); repintarCard(t); toast('Guardado', 'ok');
    } catch (err) { saving(e.currentTarget, false); toast(String(err.message || 'Error de conexión'), 'err'); }
  };
}

/* ============================================================
   WHATSAPP — el mensaje sale de la plantilla de ESTE usuario
   ============================================================ */
/* Primera palabra del nombre: "MARIA FERNANDA GAONA" → "MARIA".
   Es para saludar, no para identificar: si el nombre viene vacío, vacío sale. */
function primerNombre(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }

/* Las etiquetas se envían SIEMPRE en negrita: WhatsApp pone en negrita lo que
   va entre asteriscos, así que {nombre} sale como *Ana*. Si el usuario ya
   escribió *{nombre}*, no se duplican los asteriscos (**Ana** no es negrita:
   WhatsApp lo muestra tal cual). Si el dato viene vacío no se deja el
   asterisco huérfano: no se escribe nada. */
function plantillaRender(tpl, t) {
  const v = {
    documento: t.documento || '', nombre: t.nombre || '', p_nombre: primerNombre(t.nombre),
    residencia: t.residencia || '', municipio: t.municipio || '', puesto: t.puesto || '',
    mesa: t.mesa || '', lider: t.lider || ''
  };
  const pon = (m, k) => {
    const key = String(k).toLowerCase();
    if (!(key in v)) return m;                 // variable que no existe: se deja tal cual
    return v[key] ? '*' + v[key] + '*' : '';
  };
  return String(tpl || '')
    .replace(/\*\{([a-zA-Z_]+)\}\*/g, pon)   // el usuario ya la puso entre asteriscos
    .replace(/\{([a-zA-Z_]+)\}/g, pon);       // suelta: se le ponen igual
}

function abrirWa(t) {
  const tel = onlyDig(t.contacto);
  if (!tel) return toast('Esa persona no tiene WhatsApp registrado', 'err');
  const txt = plantillaRender((ME && ME.plantilla) || '', t).trim();
  if (!txt) return toast('Primero escribe tu mensaje en Configuración', 'err');
  const num = tel.length === 10 ? '57' + tel : tel;
  /* En el móvil, wa.me abre la app; en PC abre WhatsApp Web. */
  window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(txt), '_blank');
}

/* ============================================================
   MODAL CONFIGURACIÓN — el mensaje con variables
   ============================================================ */
function sheetConfig() {
  const vars = (VARS.length ? VARS : ['documento', 'nombre', 'p_nombre', 'residencia', 'municipio', 'puesto', 'mesa', 'lider']);
  openSheet(`<div class="grip"></div>
    <h2 class="h2">Configuración</h2>
    <p class="muted small">Escribe el mensaje que se enviará por WhatsApp. Toca una variable para insertarla donde tengas el cursor. Lo que va entre llaves se envía en <b>negrita</b>.</p>
    <div class="stack" style="margin-top:12px;">
      <textarea class="input area" id="cf-tpl" rows="8">${esc((ME && ME.plantilla) || '')}</textarea>
      <div class="var-row">${vars.map(v => `<button class="var-chip" data-v="{${v}}">{${v}}</button>`).join('')}</div>
      <div class="prev-box" id="cf-prev"></div>
      <button class="btn btn-primary btn-block" id="cf-save">Guardar</button>
      <button class="btn btn-quiet btn-block" data-close>Cerrar</button>
    </div>`);

  const ta = $('#cf-tpl');
  const prev = () => {
    const t = TARJETAS[0];
    $('#cf-prev').innerHTML = t
      ? `<b class="small">Así lo verá ${esc(t.nombre)}:</b><p class="small">${esc(plantillaRender(ta.value, t))}</p>`
      : `<b class="small">Vista previa</b><p class="small muted">Se verá cuando tengas tarjetas asignadas.</p>`;
  };
  prev();
  ta.addEventListener('input', prev);

  $$('.var-chip').forEach(b => b.onclick = () => {
    const v = b.dataset.v;
    const s = ta.selectionStart || 0, e = ta.selectionEnd || 0;
    ta.value = ta.value.slice(0, s) + v + ta.value.slice(e);
    ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length;
    prev();
  });

  $('#cf-save').onclick = async e => {
    const txt = ta.value;
    if (!txt.trim()) return toast('Escribe el mensaje', 'err');
    saving(e.currentTarget, true);
    try {
      const r = await api('center.plantilla', { pin: PIN, texto: txt });
      saving(e.currentTarget, false);
      if (!r.ok) return toast(r.msg || 'No se pudo guardar', 'err');
      ME.plantilla = r.plantilla;
      closeLayer(); toast('Mensaje guardado', 'ok');
    } catch (err) { saving(e.currentTarget, false); toast(String(err.message || 'Error de conexión'), 'err'); }
  };
}

/* ============================================================
   CIERRE DEL DÍA — observaciones (requerido) → Excel
   ============================================================ */
function cierreHtml(listo, total, hechas) {
  if (!total) return '<div id="ct-cierre"></div>';
  if (!listo) return `<div id="ct-cierre" class="card pad ct-cierre">
      <p class="muted small">Cuando <b>todas</b> las tarjetas tengan un estado se activa la observación del día y la descarga del Excel. Te faltan <b>${total - hechas}</b>.</p>
    </div>`;
  return `<div id="ct-cierre" class="card pad ct-cierre stack">
      <h3 class="h2">Observaciones del día</h3>
      <p class="muted small">Ya marcaste las ${total} tarjetas. Escribe tu observación para habilitar la descarga.</p>
      <textarea class="input area" id="ct-obs" rows="4" placeholder="Cuéntanos cómo te fue…">${esc((OBS && OBS.texto) || '')}</textarea>
      <button class="btn btn-primary btn-block" id="ct-obs-save">${OBS ? 'Actualizar observación' : 'Guardar observación'}</button>
      <button class="btn btn-ghost btn-block" id="ct-xls" ${OBS ? '' : 'disabled'}>${I.download} Descargar Excel</button>
    </div>`;
}

function bindCierre(listo) {
  if (!listo) return;
  $('#ct-obs-save').onclick = async e => {
    const txt = ($('#ct-obs').value || '').trim();
    if (!txt) return toast('La observación es obligatoria', 'err');
    saving(e.currentTarget, true);
    try {
      const r = await api('center.observacion', { pin: PIN, texto: txt });
      saving(e.currentTarget, false);
      if (!r.ok) return toast(r.msg || 'No se pudo guardar', 'err');
      OBS = r.observacion;
      const b = $('#ct-xls'); if (b) b.disabled = false;
      e.currentTarget.innerHTML = 'Actualizar observación'; e.currentTarget.dataset.txt = 'Actualizar observación';
      toast('Observación guardada', 'ok');
    } catch (err) { saving(e.currentTarget, false); toast(String(err.message || 'Error de conexión'), 'err'); }
  };

  $('#ct-xls').onclick = async e => {
    saving(e.currentTarget, true);
    try {
      const r = await api('center.excel', { pin: PIN });
      saving(e.currentTarget, false);
      if (!r.ok) return toast(r.msg || 'No se pudo generar', 'err');
      bajarBase64(r.base64, r.filename, r.mime);
      toast('Excel descargado', 'ok');
    } catch (err) { saving(e.currentTarget, false); toast(String(err.message || 'Error de conexión'), 'err'); }
  };
}

function bajarBase64(b64, filename, mime) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime || 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename || 'archivo.xlsx';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ============================================================
   ARRANQUE (gate de instalación → login → tarjetas)
   ============================================================ */
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

async function initApp() {
  if (typeof APP_VERSION !== 'undefined' && APP_VERSION) { APP_VERSION_LOADED = String(APP_VERSION); paintVersion(APP_VERSION_LOADED); }
  checkVersion(); setInterval(checkVersion, 60000);

  const hash = location.hash || '';
  const arranqueLimpio = (hash === '' || hash === '#/' || hash.startsWith('#/tarjetas'));
  const yaContinuoWeb = sessionStorage.getItem(nsKey('continuedWeb')) === '1';
  if (!isStandalone() && !yaContinuoWeb && arranqueLimpio) { location.hash = '#/instalar'; render(); return; }

  /* Sesión guardada: se revalida contra el servidor ANTES de pintar. El PIN
     guardado no significa que hoy le toque turno. */
  PIN = pinLeer();
  if (PIN) {
    try {
      const r = await api('center.login', { pin: PIN });
      if (r.ok) {
        ME = r.user; TURNO = r.turno; VARS = r.vars || [];
        if (location.hash !== '#/tarjetas') { location.hash = '#/tarjetas'; return; }  // el hashchange pinta
        return render();
      }
      pinBorrar(); return viewLogin(r.msg);
    } catch (e) { pinBorrar(); return viewLogin('No se pudo conectar. Intenta de nuevo.'); }
  }
  render();
}
initApp();
