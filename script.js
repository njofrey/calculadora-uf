document.addEventListener('DOMContentLoaded', () => {
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconWrapper = document.getElementById('icon-copy-wrapper');
    const checkIconWrapper = document.getElementById('icon-check-wrapper');
    const copyTextElement = document.getElementById('copy-text');
    const dateInput = document.getElementById('uf-date');
    const todayBtn = document.getElementById('today-btn');
    let ufRate = 0;

    const CHILE_TZ = 'America/Santiago';

    // Dia actual en Chile como "YYYY-MM-DD". No se usa la fecha local del
    // navegador: si el usuario esta en otra zona horaria, el dia no coincide.
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

    function isoADdMmYyyy(iso) {
        const [y, m, d] = iso.split('-');
        return `${d}-${m}-${y}`;
    }

    // La fecha que entrega mindicador viene a medianoche de Chile, asi que
    // los primeros 10 caracteres ya son el dia chileno.
    function diaDelDato(fechaIso) {
        return typeof fechaIso === 'string' ? fechaIso.slice(0, 10) : '';
    }

    function parseUfInput(value) {
        const numericString = value.replace(/\./g, '').replace(',', '.');
        return parseFloat(numericString) || 0;
    }

    ufInputElement.addEventListener('input', () => {
        let val = ufInputElement.value;
        val = val.replace(/\./g, '');
        val = val.replace(/[^0-9,]/g, '');
        const firstComma = val.indexOf(',');
        if (firstComma !== -1) {
            val = val.substring(0, firstComma + 1) + val.substring(firstComma + 1).replace(/,/g, '');
        }
        if (val.startsWith(',')) {
            val = '0' + val;
        }

        const [rawInt, rawDec] = val.split(',');
        let formattedInt = rawInt ? Number(rawInt).toLocaleString('es-CL') : '';
        val = rawDec !== undefined ? (rawDec === '' ? formattedInt + ',' : `${formattedInt},${rawDec}`) : formattedInt;

        ufInputElement.value = val;
        calculate();
    });

    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;

    function formatDateFromApi(fechaIso) {
        const date = fechaIso ? new Date(fechaIso) : new Date();
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function showUfValue(valor, fechaIso, { esHoy = true } = {}) {
        ufRate = valor;
        const formattedDate = formatDateFromApi(fechaIso);
        const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
        const etiqueta = esHoy ? 'UF hoy' : 'UF de ese día';
        ufDisplayElement.innerHTML = `<span>${etiqueta} = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
        calculate();
    }

    function avisarDesactualizado() {
        const aviso = document.createElement('div');
        aviso.className = 'uf-stale';
        aviso.textContent = '⚠ Aún no publican el valor de hoy — este es el último disponible';
        ufDisplayElement.appendChild(aviso);
    }

    // Solo se guarda en cache si el dato realmente corresponde al dia de hoy.
    // Si no, se muestra marcado y no se fija, para que el proximo intento lo corrija.
    function aplicarValorDeHoy(valor, fecha, hoy) {
        showUfValue(valor, fecha);
        if (diaDelDato(fecha) === hoy) {
            try {
                localStorage.setItem('uf_cache', JSON.stringify({ valor, fecha, dayKey: hoy }));
            } catch {}
        } else {
            avisarDesactualizado();
        }
    }

    function readCache() {
        const cached = localStorage.getItem('uf_cache');
        if (!cached) return null;
        try {
            return JSON.parse(cached);
        } catch {
            localStorage.removeItem('uf_cache');
            return null;
        }
    }

    async function getUfValue() {
        const today = diaEnChile();
        const cached = readCache();
        // El cache solo guarda valores ya validados como del dia, asi que
        // si la llave coincide, el valor es confiable.
        if (cached && cached.dayKey === today && diaDelDato(cached.fecha) === today) {
            showUfValue(cached.valor, cached.fecha);
            return;
        }

        try {
            const res = await fetch('/api/uf', { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error('Proxy failed');
            const { valor, fecha } = await res.json();
            aplicarValorDeHoy(valor, fecha, today);
        } catch (proxyError) {
            console.warn('Proxy falló, usando fallback directo:', proxyError);
            try {
                const res = await fetch('https://mindicador.cl/api/uf', { signal: AbortSignal.timeout(10000) });
                if (!res.ok) throw new Error('Fallback failed');
                const data = await res.json();
                const valor = data?.serie?.[0]?.valor;
                const fecha = data?.serie?.[0]?.fecha;
                if (!valor || !fecha) throw new Error('Unexpected shape');
                aplicarValorDeHoy(valor, fecha, today);
            } catch (fallbackError) {
                console.error('Fallback también falló:', fallbackError);
                if (cached && typeof cached.valor === 'number') {
                    showUfValue(cached.valor, cached.fecha);
                    const staleEl = document.createElement('div');
                    staleEl.className = 'uf-stale';
                    staleEl.textContent = '⚠ Valor desactualizado — servicio no disponible';
                    ufDisplayElement.appendChild(staleEl);
                } else if (ufRate === 0) {
                    ufDisplayElement.textContent = 'Error al cargar valor.';
                }
            }
        }
    }

    function calculate() {
        if (ufRate === 0) return;
        const ufAmount = parseUfInput(ufInputElement.value);
        const totalClp = ufAmount * ufRate;
        clpResultElement.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(totalClp);
        resultBox.dataset.rawValue = totalClp;
    }

    let copyTimeout;

    function copyResult() {
        if (resultBox.classList.contains('is-copying')) return;
        const rawValue = resultBox.dataset.rawValue;
        if (!rawValue || Number(rawValue) === 0) {
            resultBox.classList.add('shake');
            setTimeout(() => resultBox.classList.remove('shake'), 300);
            return;
        }

        const rounded = Math.round(parseFloat(rawValue));
        const formattedValue = new Intl.NumberFormat('es-CL').format(rounded);
        navigator.clipboard.writeText(formattedValue).then(() => {
            copyTextElement.textContent = 'Copiado';
            resultBox.classList.add('is-copying');

            clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                resultBox.classList.remove('is-copying');
            }, 1500);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    }

    resultBox.addEventListener('click', copyResult);
    resultBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copyResult();
        }
    });

    function limpiarResultado(mensaje) {
        ufRate = 0;
        clpResultElement.textContent = '$0';
        resultBox.dataset.rawValue = '0';
        ufDisplayElement.textContent = mensaje;
    }

    async function cargarPorFecha(isoDate) {
        ufDisplayElement.textContent = 'Buscando…';
        try {
            const res = await fetch(`/api/uf?fecha=${isoADdMmYyyy(isoDate)}`, { signal: AbortSignal.timeout(10000) });
            if (res.status === 404) {
                limpiarResultado('No hay valor de UF para ese día.');
                return;
            }
            if (!res.ok) throw new Error('Fecha failed');
            const { valor, fecha } = await res.json();
            showUfValue(valor, fecha, { esHoy: false });
        } catch (error) {
            console.error('No se pudo cargar esa fecha:', error);
            limpiarResultado('No se pudo cargar ese día.');
        }
    }

    function volverAHoy() {
        dateInput.value = diaEnChile();
        todayBtn.hidden = true;
        getUfValue();
    }

    dateInput.value = diaEnChile();
    dateInput.addEventListener('change', () => {
        const elegido = dateInput.value;
        if (!elegido || elegido === diaEnChile()) {
            volverAHoy();
            return;
        }
        todayBtn.hidden = false;
        cargarPorFecha(elegido);
    });
    todayBtn.addEventListener('click', volverAHoy);

    copyIconWrapper.innerHTML = iconCopy;
    checkIconWrapper.innerHTML = iconCheck;
    getUfValue();
});
