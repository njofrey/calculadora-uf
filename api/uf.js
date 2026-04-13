export default async function handler(req, res) {
    try {
        const response = await fetch('https://mindicador.cl/api/uf', {
            signal: AbortSignal.timeout(9000)
        });
        if (!response.ok) throw new Error('API response not ok');
        const data = await response.json();
        const entry = data?.serie?.[0];
        if (typeof entry?.valor !== 'number' || !Number.isFinite(entry.valor) || typeof entry?.fecha !== 'string') {
            throw new Error('Unexpected API shape');
        }

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json({ valor: entry.valor, fecha: entry.fecha });
    } catch (error) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(500).json({ error: 'No se pudo obtener el valor de la UF' });
    }
}
