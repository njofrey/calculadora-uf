export default async function handler(req, res) {
    try {
        const response = await fetch('https://mindicador.cl/api/uf');
        if (!response.ok) throw new Error('API response not ok');
        const data = await response.json();
        const valor = data.serie[0].valor;
        const fecha = data.serie[0].fecha;

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json({ valor, fecha });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo obtener el valor de la UF' });
    }
}
