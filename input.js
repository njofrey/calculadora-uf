export function parseUfInput(value) {
    const numericString = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(numericString) || 0;
}

// Normaliza tanto el formato chileno (1.000,5) como valores que suelen
// pegarse desde otros contextos (1.5). En pantalla siempre usamos coma.
export function normalizeUfInput(value) {
    let val = value.replace(/[^0-9.,]/g, '');
    const hasComma = val.includes(',');
    const isThousandsOnly = /^\d{1,3}(?:\.\d{3})+$/.test(val);

    if (hasComma || isThousandsOnly) {
        val = val.replace(/\./g, '');
    } else if (val.includes('.')) {
        val = val.replace('.', ',').replace(/\./g, '');
    }

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
