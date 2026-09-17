export function parseUfInput(value) {
    const numericString = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(numericString) || 0;
}

// El punto siempre separa miles; solo una coma explícita inicia decimales.
// Esto también permite seguir escribiendo sobre los miles autoformateados.
export function normalizeUfInput(value) {
    let val = value.replace(/[^0-9,]/g, '');

    const firstComma = val.indexOf(',');
    if (firstComma !== -1) {
        val = val.substring(0, firstComma + 1) + val.substring(firstComma + 1).replace(/,/g, '');
    }
    if (val.startsWith(',')) val = '0' + val;

    const [rawInt, rawDec] = val.split(',');
    const formattedInt = rawInt ? Number(rawInt).toLocaleString('es-CL') : '';
    return rawDec !== undefined
        ? (rawDec === '' ? formattedInt + ',' : `${formattedInt},${rawDec}`)
        : formattedInt;
}
