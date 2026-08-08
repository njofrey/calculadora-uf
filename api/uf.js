const CHILE_TZ = 'America/Santiago';
const FECHA_RE = /^\d{2}-\d{2}-\d{4}$/;

// Devuelve el dia actual en Chile como "YYYY-MM-DD".
// No se usa la fecha del servidor porque Vercel corre en UTC.
function diaEnChile() {
    const partes = new Intl.DateTimeFormat('en-US', {
        timeZone: CHILE_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const v = (tipo) => partes.find((p) => p.type === tipo).value;
    return `${v('year')}-${v('month')}-${v('day')}`;
}

export default async function handler(req, res) {
    const fechaParam = typeof req.query?.fecha === 'string' ? req.query.fecha : '';

    if (fechaParam && !FECHA_RE.test(fechaParam)) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(400).json({ error: 'Formato de fecha invalido, se espera DD-MM-YYYY' });
    }

    const url = fechaParam
        ? `https://mindicador.cl/api/uf/${fechaParam}`
        : 'https://mindicador.cl/api/uf';

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(9000) });
        if (!response.ok) throw new Error('API response not ok');
        const data = await response.json();

        if (!Array.isArray(data?.serie) || data.serie.length === 0) {
            res.setHeader('Cache-Control', 'no-store');
            return res.status(404).json({ error: 'No hay valor de UF para esa fecha' });
        }

        const entry = data.serie[0];
        if (typeof entry?.valor !== 'number' || !Number.isFinite(entry.valor) || typeof entry?.fecha !== 'string') {
            throw new Error('Unexpected API shape');
        }

        if (fechaParam) {
            // Un dia pasado ya no cambia: se puede cachear largo.
            res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=604800');
        } else {
            // Si mindicador todavia no publica el valor de hoy, se cachea poco
            // para reintentar pronto en vez de servir el de ayer todo el dia.
            const esDeHoy = entry.fecha.slice(0, 10) === diaEnChile();
            res.setHeader('Cache-Control', esDeHoy
                ? 's-maxage=3600, stale-while-revalidate=86400'
                : 's-maxage=300');
        }

        res.status(200).json({ valor: entry.valor, fecha: entry.fecha });
    } catch (error) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(500).json({ error: 'No se pudo obtener el valor de la UF' });
    }
}
