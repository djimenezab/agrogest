/* AgroGest — control de parcelas, producción, gastos e ingresos.
   Almacena los datos en localStorage y, si se configura, los sincroniza
   con un único archivo JSON en un repositorio de GitHub (API de contenidos). */

const DB_KEY = 'agrogest_db';
const CFG_KEY = 'agrogest_cfg';

const ENTIDADES = {
  parcelas: {
    label: 'Parcelas', singular: 'parcela', icon: '🌱',
    campos: [
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['Viña', 'Almendro', 'Otro'], required: true },
      { key: 'variedad', label: 'Variedad', type: 'text' },
      { key: 'ref_catastral', label: 'Ref. Catastral', type: 'text' },
      { key: 'provincia', label: 'Provincia', type: 'text', maxLength: 2 },
      { key: 'municipio', label: 'Municipio', type: 'text', maxLength: 3 },
      { key: 'poligono', label: 'Polígono', type: 'text' },
      { key: 'num_parcela', label: 'Parcela (nº catastral)', type: 'text' },
      { key: 'subparcela', label: 'Subparcela', type: 'text' },
      { key: 'superficie_ha', label: 'Superficie (ha)', type: 'number', step: '0.01' },
      { key: 'num_plantas', label: 'Nº de cepas / árboles', type: 'number', step: '1' },
      { key: 'anio_plantacion', label: 'Año de plantación', type: 'number', step: '1' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['nombre', 'tipo', 'variedad', 'superficie_ha', 'num_plantas'],
  },
  producciones: {
    label: 'Producción', singular: 'entrada de producción', icon: '🍇',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela', required: true },
      { key: 'fecha', label: 'Fecha de descarga', type: 'date', required: true, default: 'today' },
      { key: 'kg', label: 'Kilos', type: 'number', step: '0.1', required: true },
      { key: 'hora', label: 'Hora', type: 'time' },
      { key: 'num_ticket', label: 'Nº Ticket', type: 'text' },
      { key: 'calidad', label: 'Calidad', type: 'text' },
      { key: 'grado', label: 'Grado (º Baumé / Brix)', type: 'number', step: '0.1', soloParaTipo: ['Viña'] },
      { key: 'ph', label: 'pH', type: 'number', step: '0.01' },
      { key: 'gluconico', label: 'Glucónico', type: 'number', step: '0.01' },
      { key: 'cooperativa', label: 'Cooperativa / destino', type: 'text' },
      { key: 'precio_kg', label: 'Precio €/kg (si se conoce)', type: 'number', step: '0.0001', money: true },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['fecha', 'parcela_id', 'kg', 'grado', 'cooperativa'],
  },
  gastos: {
    label: 'Gastos', singular: 'gasto', icon: '💶',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela' },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true, default: 'today' },
      { key: 'categoria', label: 'Categoría', type: 'select', required: true,
        options: ['Fitosanitario', 'Abono / fertilizante', 'Maquinaria', 'Mano de obra', 'Seguro', 'Combustible', 'Agua / riego', 'Otros'] },
      { key: 'concepto', label: 'Concepto', type: 'text', required: true },
      { key: 'importe', label: 'Importe (€)', type: 'number', step: '0.01', required: true, money: true },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['fecha', 'parcela_id', 'categoria', 'concepto', 'importe'],
  },
  ingresos: {
    label: 'Ingresos', singular: 'ingreso', icon: '💰',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela' },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true, default: 'today' },
      { key: 'concepto', label: 'Concepto', type: 'text', required: true },
      { key: 'importe', label: 'Importe (€)', type: 'number', step: '0.01', required: true, money: true },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['fecha', 'parcela_id', 'concepto', 'importe'],
  },
  tratamientos: {
    label: 'Sanidad', singular: 'tratamiento', icon: '🧪',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela', required: true },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true, default: 'today' },
      { key: 'tipo', label: 'Tipo', type: 'select', required: true,
        options: ['Tratamiento preventivo', 'Plaga', 'Enfermedad', 'Otro'] },
      { key: 'producto', label: 'Producto', type: 'text' },
      { key: 'dosis', label: 'Dosis', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['fecha', 'parcela_id', 'tipo', 'producto'],
  },
  seguros: {
    label: 'Seguros', singular: 'seguro', icon: '🛡️',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela' },
      { key: 'compania', label: 'Compañía', type: 'text', required: true },
      { key: 'num_poliza', label: 'Nº de póliza', type: 'text' },
      { key: 'cobertura', label: 'Cobertura', type: 'text' },
      { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
      { key: 'fecha_fin', label: 'Fecha de fin', type: 'date' },
      { key: 'importe_prima', label: 'Importe prima (€)', type: 'number', step: '0.01', money: true },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['compania', 'num_poliza', 'cobertura', 'fecha_fin'],
  },
  tareas: {
    label: 'Tareas', singular: 'tarea', icon: '✅',
    campos: [
      { key: 'parcela_id', label: 'Parcela', type: 'parcela' },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true, default: 'today' },
      { key: 'tipo', label: 'Tipo de tarea', type: 'tipoTarea', required: true },
      { key: 'descripcion', label: 'Detalle', type: 'text' },
      { key: 'horas', label: 'Horas invertidas', type: 'number', step: '0.5' },
      { key: 'estado', label: 'Estado', type: 'select', required: true, default: 'Pendiente', options: ['Pendiente', 'Hecho'] },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
    listCols: ['fecha', 'parcela_id', 'tipo', 'horas', 'estado'],
  },
  tiposTarea: {
    label: 'Tipos de tarea', singular: 'tipo de tarea', icon: '🏷️',
    campos: [{ key: 'nombre', label: 'Nombre', type: 'text', required: true }],
    listCols: ['nombre'],
  },
};

const NAV = [
  { key: 'inicio', label: 'Inicio', icon: '🏠' },
  { key: 'producciones', label: 'Producción', icon: '🍇' },
  { key: 'parcelas', label: 'Parcelas', icon: '🌱' },
  { key: 'gastos', label: 'Gastos', icon: '💶' },
  { key: 'ingresos', label: 'Ingresos', icon: '💰' },
  { key: 'tratamientos', label: 'Sanidad', icon: '🧪' },
  { key: 'seguros', label: 'Seguros', icon: '🛡️' },
  { key: 'tareas', label: 'Tareas', icon: '✅' },
  { key: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

let DB = null;
let SHA = null;
let CONFIG = {};

// ---------- utilidades ----------
function uid() { return crypto.randomUUID(); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function formatFecha(iso) { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
function eur(n) { return Number(n || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }); }
function b64EncodeUnicode(str) { return btoa(unescape(encodeURIComponent(str))); }
function b64DecodeUnicode(str) { return decodeURIComponent(escape(atob(str.replace(/\n/g, '')))); }
const TIPOS_TAREA_INICIALES = ['Poda', 'Riego', 'Labranza', 'Aplicación de producto', 'Atado de alambres', 'Vendimia / recolección', 'Abonado'];
function emptyDB() {
  const db = {};
  Object.keys(ENTIDADES).forEach(k => { db[k] = []; });
  db.tiposTarea = TIPOS_TAREA_INICIALES.map(nombre => ({ id: uid(), nombre }));
  return db;
}

// ---------- persistencia local ----------
function loadLocal() {
  try { const raw = localStorage.getItem(DB_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveLocal() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
function loadConfig() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; }
  catch { return {}; }
}
function isConfigured() { return !!(CONFIG.token && CONFIG.owner && CONFIG.repo); }

// ---------- sincronización con GitHub ----------
// estado: 'gray' sin configurar · 'amber' sincronizando · 'green' al día · 'red' error/sin conexión
function setSyncStatus(msg, estado) {
  const el = document.getElementById('syncStatus');
  if (el) el.textContent = msg || '';
  const dot = document.getElementById('syncDot');
  if (dot && estado) dot.className = 'dot dot-' + estado;
}
function githubHeaders(json) {
  const h = { Authorization: `token ${CONFIG.token}`, Accept: 'application/vnd.github+json' };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}
function githubContentsUrl() {
  return `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`;
}
async function pullFromGitHub(manual) {
  if (!isConfigured()) { if (manual) setSyncStatus('Configura usuario, repositorio y token en Ajustes', 'gray'); return; }
  setSyncStatus('Cargando desde GitHub…', 'amber');
  try {
    const res = await fetch(`${githubContentsUrl()}?ref=${encodeURIComponent(CONFIG.branch || 'main')}`, { headers: githubHeaders() });
    if (res.status === 404) { SHA = null; setSyncStatus('Sin datos aún en el repositorio; se crearán al guardar', 'green'); return; }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    SHA = json.sha;
    // Se fusiona con emptyDB() para no romperse si el archivo remoto viene
    // de una versión anterior a la que añadió alguna colección nueva.
    DB = { ...emptyDB(), ...JSON.parse(b64DecodeUnicode(json.content)) };
    saveLocal();
    setSyncStatus('Sincronizado ✓', 'green');
    render();
  } catch (e) {
    setSyncStatus('No se pudo cargar de GitHub (' + e.message + ')', 'red');
  }
}
async function pushToGitHub(mensaje) {
  if (!isConfigured()) return;
  setSyncStatus('Guardando en GitHub…', 'amber');
  try {
    const body = { message: mensaje, content: b64EncodeUnicode(JSON.stringify(DB, null, 2)), branch: CONFIG.branch || 'main' };
    if (SHA) body.sha = SHA;
    const res = await fetch(githubContentsUrl(), { method: 'PUT', headers: githubHeaders(true), body: JSON.stringify(body) });
    if (res.status === 409) {
      setSyncStatus('Conflicto: recargando datos más recientes…', 'amber');
      await pullFromGitHub();
      alert('Otro cambio se guardó primero. Se han recargado los datos más recientes; repite tu cambio si hace falta.');
      return;
    }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    SHA = json.content.sha;
    setSyncStatus('Guardado ✓ ' + new Date().toLocaleTimeString('es-ES'), 'green');
  } catch (e) {
    setSyncStatus('Guardado en local (sin conexión a GitHub)', 'red');
  }
}

// ---------- mutaciones de datos ----------
function upsert(key, data, id) {
  const list = DB[key];
  if (id) {
    const idx = list.findIndex(x => x.id === id);
    list[idx] = { ...list[idx], ...data, id };
  } else {
    data.id = uid();
    list.push(data);
  }
  saveLocal();
  render();
  if (isConfigured()) pushToGitHub(`AgroGest: actualiza ${key}`);
}
function eliminar(key, id) {
  if (!confirm('¿Eliminar este registro?')) return;
  DB[key] = DB[key].filter(x => x.id !== id);
  saveLocal();
  render();
  if (isConfigured()) pushToGitHub(`AgroGest: elimina registro de ${key}`);
}

// ---------- formulario genérico ----------
function openForm(key, id) {
  const cfg = ENTIDADES[key];
  const necesitaParcela = cfg.campos.some(c => c.type === 'parcela' && c.required);
  if (necesitaParcela && DB.parcelas.length === 0) {
    alert('Primero crea una parcela en la pestaña "Parcelas".');
    location.hash = '#/parcelas';
    return;
  }
  const necesitaTipoTarea = cfg.campos.some(c => c.type === 'tipoTarea' && c.required);
  if (necesitaTipoTarea && DB.tiposTarea.length === 0) {
    alert('Primero añade un tipo de tarea en Ajustes.');
    location.hash = '#/ajustes';
    return;
  }
  const item = id ? DB[key].find(x => x.id === id) : null;
  const form = document.getElementById('entityForm');
  form.innerHTML = '';

  const h = document.createElement('h2');
  h.textContent = (item ? 'Editar ' : 'Nueva/o ') + cfg.singular;
  form.appendChild(h);

  cfg.campos.forEach(campo => {
    const wrap = document.createElement('div'); wrap.className = 'campo'; wrap.id = 'wrap_' + campo.key;
    const label = document.createElement('label'); label.textContent = campo.label; label.htmlFor = 'f_' + campo.key;
    wrap.appendChild(label);

    let input;
    if (campo.type === 'textarea') {
      input = document.createElement('textarea');
    } else if (campo.type === 'select') {
      input = document.createElement('select');
      campo.options.forEach(opt => { const o = document.createElement('option'); o.value = opt; o.textContent = opt; input.appendChild(o); });
    } else if (campo.type === 'parcela') {
      input = document.createElement('select');
      if (!campo.required) { const o = document.createElement('option'); o.value = ''; o.textContent = '(general / sin parcela)'; input.appendChild(o); }
      DB.parcelas.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = p.nombre; input.appendChild(o); });
    } else if (campo.type === 'tipoTarea') {
      input = document.createElement('select');
      if (!campo.required) { const o = document.createElement('option'); o.value = ''; o.textContent = '(sin tipo)'; input.appendChild(o); }
      DB.tiposTarea.forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.nombre; input.appendChild(o); });
    } else {
      input = document.createElement('input');
      input.type = campo.type;
      if (campo.step) input.step = campo.step;
      if (campo.maxLength) input.maxLength = campo.maxLength;
    }
    input.id = 'f_' + campo.key;
    input.name = campo.key;
    if (campo.required) input.required = true;

    let value = item ? item[campo.key] : undefined;
    if (value === undefined || value === null) {
      if (campo.default === 'today') value = todayISO();
      else if (campo.default) value = campo.default;
    }
    if (value !== undefined && value !== null) input.value = value;

    wrap.appendChild(input);
    form.appendChild(wrap);
  });

  // Algunos campos (p.ej. grado, solo en viña) solo se muestran según el
  // tipo de la parcela elegida; se recalcula al construir el formulario y
  // cada vez que cambia la parcela seleccionada.
  const actualizarVisibilidad = () => {
    const parcelaInput = form.elements['parcela_id'];
    const parcela = parcelaInput ? DB.parcelas.find(p => p.id === parcelaInput.value) : null;
    cfg.campos.forEach(campo => {
      if (!campo.soloParaTipo) return;
      const visible = !!parcela && campo.soloParaTipo.includes(parcela.tipo);
      document.getElementById('wrap_' + campo.key).style.display = visible ? '' : 'none';
    });
  };
  if (form.elements['parcela_id']) {
    form.elements['parcela_id'].addEventListener('change', actualizarVisibilidad);
    actualizarVisibilidad();
  }

  const acciones = document.createElement('div'); acciones.className = 'form-acciones';
  const btnCancel = document.createElement('button');
  btnCancel.type = 'button'; btnCancel.className = 'btn-secondary'; btnCancel.textContent = 'Cancelar';
  btnCancel.onclick = () => document.getElementById('formDialog').close();
  acciones.appendChild(btnCancel);

  if (item) {
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button'; btnDelete.className = 'btn-danger'; btnDelete.textContent = 'Eliminar';
    btnDelete.onclick = () => { document.getElementById('formDialog').close(); eliminar(key, item.id); };
    acciones.appendChild(btnDelete);
  }
  const btnSave = document.createElement('button');
  btnSave.type = 'submit'; btnSave.className = 'btn-primary'; btnSave.textContent = 'Guardar';
  acciones.appendChild(btnSave);
  form.appendChild(acciones);

  form.onsubmit = (e) => {
    e.preventDefault();
    const data = {};
    cfg.campos.forEach(campo => {
      if (campo.soloParaTipo && document.getElementById('wrap_' + campo.key).style.display === 'none') {
        data[campo.key] = null;
        return;
      }
      let v = form.elements[campo.key].value;
      if (campo.type === 'number') v = v === '' ? null : parseFloat(v);
      data[campo.key] = v;
    });
    upsert(key, data, item ? item.id : null);
    document.getElementById('formDialog').close();
  };

  document.getElementById('formDialog').showModal();
}

// ---------- vistas ----------
function formatValor(campo, valor) {
  if (valor === undefined || valor === null || valor === '') return '—';
  if (campo.type === 'parcela') { const p = DB.parcelas.find(x => x.id === valor); return p ? p.nombre : '—'; }
  if (campo.type === 'tipoTarea') { const t = DB.tiposTarea.find(x => x.id === valor); return t ? t.nombre : '—'; }
  if (campo.type === 'date') return formatFecha(valor);
  if (campo.money) return eur(valor);
  return valor;
}

function entityTableHTML(key, headingTag) {
  const cfg = ENTIDADES[key];
  const list = [...DB[key]];
  const tieneFecha = cfg.campos.some(c => c.key === 'fecha');
  list.sort((a, b) => tieneFecha ? (b.fecha || '').localeCompare(a.fecha || '') : (a.nombre || '').localeCompare(b.nombre || ''));

  let html = `<div class="toolbar"><${headingTag}>${cfg.icon} ${cfg.label}</${headingTag}><button class="btn-primary" onclick="openForm('${key}')">+ Nuevo/a</button></div>`;

  if (list.length === 0) {
    html += `<div class="vacio">Todavía no hay registros. Pulsa "+ Nuevo/a" para añadir el primero.</div>`;
  } else {
    html += '<div class="table-wrap"><table><thead><tr>';
    cfg.listCols.forEach(colKey => { html += `<th>${cfg.campos.find(c => c.key === colKey).label}</th>`; });
    html += '<th></th></tr></thead><tbody>';
    list.forEach(item => {
      html += `<tr onclick="openForm('${key}','${item.id}')">`;
      cfg.listCols.forEach(colKey => {
        const campo = cfg.campos.find(c => c.key === colKey);
        html += `<td>${formatValor(campo, item[colKey])}</td>`;
      });
      html += `<td><button class="btn-small btn-secondary" onclick="event.stopPropagation(); openForm('${key}','${item.id}')" title="Editar" aria-label="Editar">✏️</button></td></tr>`;
    });
    html += '</tbody></table></div>';
  }
  return html;
}
function renderEntityList(key) {
  document.getElementById('app').innerHTML = entityTableHTML(key, 'h1');
}

function renderDashboard() {
  const anios = new Set([new Date().getFullYear()]);
  ['producciones', 'gastos', 'ingresos'].forEach(k => DB[k].forEach(it => { if (it.fecha) anios.add(parseInt(it.fecha.slice(0, 4), 10)); }));
  const aniosArr = [...anios].sort((a, b) => b - a);
  if (!window._anioSel || !aniosArr.includes(window._anioSel)) window._anioSel = aniosArr[0];
  const anio = window._anioSel, anioPrev = anio - 1;

  const sumaKg = a => DB.producciones.filter(p => p.fecha && p.fecha.startsWith(String(a))).reduce((s, p) => s + (p.kg || 0), 0);
  const sumaImporte = (list, a) => list.filter(x => x.fecha && x.fecha.startsWith(String(a))).reduce((s, x) => s + (x.importe || 0), 0);

  const kg = sumaKg(anio), kgPrev = sumaKg(anioPrev);
  const gastos = sumaImporte(DB.gastos, anio);
  const ingresos = sumaImporte(DB.ingresos, anio);
  const balance = ingresos - gastos;
  const deltaKg = kgPrev > 0 ? ((kg - kgPrev) / kgPrev * 100) : null;

  let html = `<h1>Resumen</h1>
  <div class="toolbar">
    <label for="anioSelector">Campaña:</label>
    <select id="anioSelector" onchange="cambiarAnio(this.value)">
      ${aniosArr.map(a => `<option value="${a}" ${a === anio ? 'selected' : ''}>${a}</option>`).join('')}
    </select>
    <button class="btn-primary" onclick="openForm('producciones')">+ Registrar descarga</button>
  </div>
  <div class="grid-resumen">
    <div class="stat"><div class="valor">${kg.toLocaleString('es-ES')} kg</div><div class="etiqueta">Producción ${anio}</div>
      ${deltaKg !== null ? `<div class="delta ${deltaKg >= 0 ? 'up' : 'down'}">${deltaKg >= 0 ? '▲' : '▼'} ${Math.abs(deltaKg).toFixed(1)}% vs ${anioPrev}</div>` : ''}
    </div>
    <div class="stat"><div class="valor">${eur(gastos)}</div><div class="etiqueta">Gastos ${anio}</div></div>
    <div class="stat"><div class="valor">${eur(ingresos)}</div><div class="etiqueta">Ingresos ${anio}</div></div>
    <div class="stat"><div class="valor" style="color:${balance >= 0 ? 'var(--verde)' : 'var(--rojo)'}">${eur(balance)}</div><div class="etiqueta">Balance ${anio}</div></div>
  </div>
  <div class="card"><h3>Por parcela</h3><div class="table-wrap"><table>
    <thead><tr><th>Parcela</th><th>Kg ${anio}</th><th>Kg ${anioPrev}</th><th>Gastos</th><th>Ingresos</th><th>Balance</th></tr></thead>
    <tbody>`;

  if (DB.parcelas.length === 0) {
    html += `<tr><td colspan="6">Añade tus parcelas para ver el detalle aquí.</td></tr>`;
  } else {
    DB.parcelas.forEach(p => {
      const enAnio = x => x.parcela_id === p.id && x.fecha && x.fecha.startsWith(String(anio));
      const enAnioPrev = x => x.parcela_id === p.id && x.fecha && x.fecha.startsWith(String(anioPrev));
      const kgP = DB.producciones.filter(enAnio).reduce((s, x) => s + (x.kg || 0), 0);
      const kgPP = DB.producciones.filter(enAnioPrev).reduce((s, x) => s + (x.kg || 0), 0);
      const gP = DB.gastos.filter(enAnio).reduce((s, x) => s + (x.importe || 0), 0);
      const iP = DB.ingresos.filter(enAnio).reduce((s, x) => s + (x.importe || 0), 0);
      html += `<tr><td>${p.nombre}</td><td>${kgP.toLocaleString('es-ES')}</td><td>${kgPP.toLocaleString('es-ES')}</td><td>${eur(gP)}</td><td>${eur(iP)}</td><td>${eur(iP - gP)}</td></tr>`;
    });
  }
  html += '</tbody></table></div></div>';
  document.getElementById('app').innerHTML = html;
}
function cambiarAnio(v) { window._anioSel = parseInt(v, 10); renderDashboard(); }

function renderAjustes() {
  const c = CONFIG;
  document.getElementById('app').innerHTML = `
  <h1>⚙️ Ajustes</h1>
  <div class="card">
    <h3>Sincronización con GitHub</h3>
    <p class="ajustes-help">Crea un repositorio (puede ser privado) en GitHub para guardar los datos, p.ej. <code>agrogest-data</code>,
    y un token de acceso personal con permiso <code>repo</code> en
    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener">github.com/settings/tokens</a>.
    Los datos de la app se guardan en un único archivo JSON dentro de ese repositorio.</p>
    <div class="campo"><label>Usuario / organización</label><input id="cfgOwner" value="${c.owner || ''}" placeholder="tu-usuario"></div>
    <div class="campo"><label>Repositorio</label><input id="cfgRepo" value="${c.repo || ''}" placeholder="agrogest-data"></div>
    <div class="campo"><label>Rama</label><input id="cfgBranch" value="${c.branch || 'main'}"></div>
    <div class="campo"><label>Ruta del archivo</label><input id="cfgPath" value="${c.path || 'data/agrogest-data.json'}"></div>
    <div class="campo"><label>Token de acceso personal</label><input id="cfgToken" type="password" value="${c.token || ''}" placeholder="ghp_..."></div>
    <div class="ajustes-acciones">
      <button class="btn-primary" onclick="guardarConfig()">Guardar configuración</button>
      <button class="btn-secondary" onclick="pullFromGitHub(true)">Cargar ahora desde GitHub</button>
    </div>
    <p class="ajustes-help">El token se guarda solo en este dispositivo (localStorage); nunca se sube al repositorio.</p>
  </div>
  <div class="card">
    <p class="ajustes-help">Categorías para clasificar las tareas (poda, riego, labranza…) y poder ver luego horas y gasto invertido por tipo.</p>
    ${entityTableHTML('tiposTarea', 'h3')}
  </div>
  <div class="card">
    <h3>Copia de seguridad local</h3>
    <div class="ajustes-acciones">
      <button class="btn-secondary" onclick="exportarJSON()">⬇ Descargar copia (JSON)</button>
      <label class="btn btn-secondary">⬆ Importar copia
        <input type="file" accept="application/json" style="display:none" onchange="importarJSON(event)">
      </label>
    </div>
  </div>`;
}
function guardarConfig() {
  CONFIG = {
    owner: document.getElementById('cfgOwner').value.trim(),
    repo: document.getElementById('cfgRepo').value.trim(),
    branch: document.getElementById('cfgBranch').value.trim() || 'main',
    path: document.getElementById('cfgPath').value.trim() || 'data/agrogest-data.json',
    token: document.getElementById('cfgToken').value.trim(),
  };
  localStorage.setItem(CFG_KEY, JSON.stringify(CONFIG));
  setSyncStatus('Configuración guardada');
  pullFromGitHub();
}
function exportarJSON() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `agrogest-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!confirm('Esto sustituirá todos los datos actuales por los del archivo importado. ¿Continuar?')) return;
      DB = { ...emptyDB(), ...data };
      saveLocal();
      render();
      if (isConfigured()) pushToGitHub('AgroGest: importa copia de seguridad');
    } catch (e) {
      alert('El archivo no es un JSON válido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ---------- navegación ----------
function renderNav() {
  const current = location.hash.replace('#/', '') || 'inicio';
  document.getElementById('nav').innerHTML = NAV.map(n =>
    `<button class="${n.key === current ? 'active' : ''}" onclick="location.hash='#/${n.key}'">${n.icon} ${n.label}</button>`
  ).join('');
}
function render() {
  renderNav();
  const key = location.hash.replace('#/', '') || 'inicio';
  if (key === 'inicio') renderDashboard();
  else if (key === 'ajustes') renderAjustes();
  else if (ENTIDADES[key]) renderEntityList(key);
  else location.hash = '#/inicio';
}
window.addEventListener('hashchange', render);

// ---------- arranque ----------
async function init() {
  DB = { ...emptyDB(), ...(loadLocal() || {}) };
  CONFIG = loadConfig();
  render();
  if (isConfigured()) await pullFromGitHub();
}
document.addEventListener('DOMContentLoaded', init);
