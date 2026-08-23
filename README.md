# AgroGest 🍇🌰

Control de parcelas, producción, gastos e ingresos para viña y almendros.
App web estática (sin frameworks, sin build): HTML + CSS + JS puro.

## Cómo se guardan los datos

- Todo se guarda primero en el `localStorage` del navegador: funciona sin
  configurar nada, sin conexión, y no se pierde nada aunque no uses GitHub.
- Si en **Ajustes** configuras un usuario, repositorio y token de GitHub,
  cada alta/edición/baja se sube automáticamente a un único archivo
  `data/agrogest-data.json` en ese repositorio (API de contenidos de
  GitHub), y al abrir la app se descarga la última versión. Así tú y tu
  mujer veis los mismos datos desde cualquier dispositivo.
- El token se guarda solo en el dispositivo (localStorage), nunca se sube
  al repositorio.

## Probarla en local

No requiere `npm install` ni build. Solo un servidor estático (el `fetch`
a la API de GitHub no funciona abriendo el `index.html` con `file://`):

```
npx serve .
# o
python -m http.server 8000
```

Abre `http://localhost:8000` (o el puerto que indique). En el móvil,
usa el "Compartir → Añadir a pantalla de inicio" para tenerla como app.

## Conectar con GitHub (opcional, para compartir datos entre dispositivos)

1. Crea un repositorio en GitHub (puede ser privado), p. ej. `agrogest-data`.
2. Genera un token en <https://github.com/settings/tokens> (classic, scope
   `repo`).
3. En la app, pestaña **Ajustes**: pon tu usuario, el nombre del
   repositorio y el token. Guarda.
4. Repite en el dispositivo de tu mujer con el mismo repositorio (puede
   usar el mismo token o generar uno propio con el mismo permiso).

## Estructura

```
index.html        esqueleto de la página (cabecera, menú, contenedor)
css/style.css      estilos, mobile-first
js/app.js          lógica: entidades, formularios, listas, resumen, sync GitHub
manifest.json       para "añadir a pantalla de inicio" en el móvil
test.html          comprobación manual de las funciones clave (ábrelo en el navegador)
```

## Qué controla

- **Parcelas**: nombre, tipo (viña/almendro), variedad, superficie, nº de
  cepas/árboles, año de plantación.
- **Producción**: cada descarga en cooperativa (parcela, fecha, kg, grado,
  destino, precio si se conoce) — pensado para ir metiendo la vendimia
  entrada a entrada.
- **Gastos** e **Ingresos**: por parcela o generales, con categoría/importe.
- **Sanidad**: tratamientos, plagas, enfermedades por parcela.
- **Seguros**: compañía, póliza, cobertura, vigencia, prima.
- **Tareas**: pendiente/hecho, por parcela.
- **Inicio**: resumen por campaña — kg totales y por parcela comparados con
  el año anterior, gastos, ingresos y balance.

## Pendiente / posibles mejoras (no incluidas aún)

- Login o control de acceso (hoy cualquiera con el enlace + token puede
  escribir; suficiente para uso privado de 2 personas).
- Gráficas de evolución entre campañas.
- Publicarla en GitHub Pages para acceder desde el móvil sin `localhost`.

Skipped a propósito: framework JS, build/bundler, base de datos/servidor
propio — con 2 usuarios y esta cantidad de datos, JSON en GitHub +
localStorage es suficiente. Añadir backend si algún día hace falta
multiusuario más amplio o consultas más pesadas.
