const CHILE_TZ = 'America/Santiago';
const TIMEOUT_MS = 9000;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Devuelve el dia actual en Chile como "YYYY-MM-DD".
// No se usa la fecha del servidor porque Vercel corre en UTC.
export function diaEnChile(fecha = new Date()) {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: CHILE_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(fecha);
    const v = (tipo) => partes.find((p) => p.type === tipo).value;
    return `${v('year')}-${v('month')}-${v('day')}`;
}

function valorValido(valor) {
    return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

// Fuente 1: mindicador.cl (JSON). Desde nov 2026 a veces tarda 20-60 s.
async function desdeMindicador() {
    const response = await fetch('https://mindicador.cl/api/uf', {
        signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) throw new Error('mindicador: respuesta no ok');
    const data = await response.json();
    const entry = data?.serie?.[0];
    if (!valorValido(entry?.valor) || typeof entry?.fecha !== 'string') {
        throw new Error('mindicador: formato inesperado');
    }
    return { valor: entry.valor, fecha: entry.fecha, fuente: 'mindicador' };
}

// Lee la tabla anual de UF del SII y devuelve el valor de un dia.
// La tabla tiene un bloque por mes (id='mes_noviembre') con pares
// <th><strong>DIA</strong></th><td>41.350,42</td>.
export function leerTablaSii(html, dia) {
    const [, mes, d] = dia.split('-');
    const inicio = html.indexOf(`id='mes_${MESES[Number(mes) - 1]}'`);
    if (inicio === -1) return null;
    const fin = html.indexOf("class='meses'", inicio + 1);
    const bloque = html.slice(inicio, fin === -1 ? undefined : fin);
    const patron = /<strong>\s*(\d{1,2})\s*<\/strong>\s*<\/th>\s*<td[^>]*>\s*([\d.]+,\d+)\s*<\/td>/g;
    for (const [, diaTabla, texto] of bloque.matchAll(patron)) {
        if (Number(diaTabla) === Number(d)) {
            const valor = Number(texto.replace(/\./g, '').replace(',', '.'));
            return valorValido(valor) ? valor : null;
        }
    }
    return null;
}

// Fuente 2 (respaldo): tabla oficial del SII, sin clave.
async function desdeSii() {
    const hoy = diaEnChile();
    const response = await fetch(`https://www.sii.cl/valores_y_fechas/uf/uf${hoy.slice(0, 4)}.htm`, {
        signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) throw new Error('sii: respuesta no ok');
    const valor = leerTablaSii(await response.text(), hoy);
    if (valor === null) throw new Error('sii: no esta el valor de hoy');
    // Mediodia UTC: el dia es el mismo en cualquier zona horaria del navegador.
    return { valor, fecha: `${hoy}T12:00:00.000Z`, fuente: 'sii' };
}

export default async function handler(req, res) {
    try {
        // Las dos fuentes se piden a la vez; gana la primera respuesta valida.
        const { valor, fecha, fuente } = await Promise.any([desdeMindicador(), desdeSii()]);

        // Si el valor no es de hoy, se cachea poco para reintentar pronto
        // en vez de servir el de ayer todo el dia.
        const esDeHoy = fecha.slice(0, 10) === diaEnChile();
        res.setHeader('Cache-Control', esDeHoy
            ? 's-maxage=3600, stale-while-revalidate=86400'
            : 's-maxage=300, stale-while-revalidate=86400');
        res.setHeader('X-UF-Fuente', fuente);

        res.status(200).json({ valor, fecha });
    } catch (error) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(500).json({ error: 'No se pudo obtener el valor de la UF' });
    }
}
