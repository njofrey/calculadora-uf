document.addEventListener('DOMContentLoaded', () => {
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconWrapper = document.getElementById('icon-copy-wrapper');
    const checkIconWrapper = document.getElementById('icon-check-wrapper');
    const copyTextElement = document.getElementById('copy-text');
    let ufRate = 0;

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

    function showUfValue(valor, fechaIso) {
        ufRate = valor;
        const formattedDate = formatDateFromApi(fechaIso);
        const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
        ufDisplayElement.innerHTML = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
        calculate();
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
        const today = new Date().toDateString();
        const cached = readCache();
        if (cached && cached.dayKey === today) {
            showUfValue(cached.valor, cached.fecha);
            return;
        }

        try {
            const res = await fetch('/api/uf', { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error('Proxy failed');
            const { valor, fecha } = await res.json();
            try { localStorage.setItem('uf_cache', JSON.stringify({ valor, fecha, dayKey: today })); } catch {}
            showUfValue(valor, fecha);
        } catch (proxyError) {
            console.warn('Proxy falló, usando fallback directo:', proxyError);
            try {
                const res = await fetch('https://mindicador.cl/api/uf', { signal: AbortSignal.timeout(10000) });
                if (!res.ok) throw new Error('Fallback failed');
                const data = await res.json();
                const valor = data?.serie?.[0]?.valor;
                const fecha = data?.serie?.[0]?.fecha;
                if (!valor || !fecha) throw new Error('Unexpected shape');
                try { localStorage.setItem('uf_cache', JSON.stringify({ valor, fecha, dayKey: today })); } catch {}
                showUfValue(valor, fecha);
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

    copyIconWrapper.innerHTML = iconCopy;
    checkIconWrapper.innerHTML = iconCheck;
    getUfValue();
});
