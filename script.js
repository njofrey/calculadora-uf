document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    const copyTextElement = document.getElementById('copy-text');
    let ufRate = 0;

    // --- FUNCIÓN PARA OBTENER EL VALOR DE LA UF ---
    async function getUfValue() {
        try {
            const response = await fetch('https://mindicador.cl/api/uf');
            if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');

            const data = await response.json();
            ufRate = data.serie[0].valor;

            const today = new Date();
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = today.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);

            ufDisplayElement.innerHTML = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;

            if (!ufInputElement.value) {
                ufInputElement.value = 1;
            }

            calculate();

        } catch (error) {
            ufDisplayElement.textContent = 'Error al cargar valor.';
            console.error(error);
        }
    }

    // --- FUNCIÓN PARA CALCULAR ---
    function calculate() {
        if (ufRate === 0) return;

        const ufAmount = parseFloat(ufInputElement.value) || 0;
        const totalClp = ufAmount * ufRate;

        clpResultElement.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(totalClp);

        resultBox.dataset.rawValue = totalClp;
    }

    // --- LÓGICA DE COPIADO ---
    resultBox.addEventListener('click', () => {
        const rawValue = resultBox.dataset.rawValue;
        if (!rawValue || resultBox.classList.contains('copied')) return;

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            const iconCopy = copyIconContainer.querySelector('.icon-copy');
            const iconCheck = copyIconContainer.querySelector('.icon-check');

            iconCopy.classList.remove('visible');
            iconCheck.classList.add('visible');
            copyTextElement.textContent = 'Copiado';
            copyTextElement.classList.add('visible');
            resultBox.classList.add('copied');

            setTimeout(() => {
                iconCopy.classList.add('visible');
                iconCheck.classList.remove('visible');
                copyTextElement.classList.remove('visible');
                resultBox.classList.remove('copied');
                setTimeout(() => { copyTextElement.textContent = ''; }, 300);
            }, 1500);
        }).catch(err => {
            console.error('Error al copiar: ', err);
            copyTextElement.textContent = 'Error';
            copyTextElement.classList.add('visible');
        });
    });

    // --- INICIALIZACIÓN ---
    ufInputElement.addEventListener('input', calculate);
    getUfValue();
});
