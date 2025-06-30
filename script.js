document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    const copyTextElement = document.getElementById('copy-text');
    let ufRate = 0;

    // --- Íconos SVG ---
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

    // --- 1. FUNCIÓN PARA OBTENER Y MOSTRAR EL VALOR DE LA UF ---
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

            // Esta es la línea que muestra el valor de la UF. Si esto falla, es la API.
            ufDisplayElement.innerHTML = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
            
            // Se calcula el valor inicial (que será $0 si el campo está vacío)
            calculate();

        } catch (error) {
            ufDisplayElement.textContent = 'Error al cargar valor.';
            console.error(error);
        }
    }

    // --- 2. FUNCIÓN PARA CALCULAR EL TOTAL ---
    function calculate() {
        if (ufRate === 0) return;

        // Si el input está vacío, "|| 0" hace que el valor sea 0.
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
        // Previene el copiado si el valor es 0 o ya está en estado "copiado"
        if (!rawValue || rawValue === '0' || resultBox.classList.contains('copied')) return;

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            copyIconContainer.innerHTML = iconCheck;
            copyTextElement.textContent = 'Copiado';
            copyTextElement.classList.add('visible');
            resultBox.classList.add('copied');

            setTimeout(() => {
                copyIconContainer.innerHTML = iconCopy;
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
    // Llama a calcular cada vez que se escribe en el input.
    ufInputElement.addEventListener('input', calculate);

    // No hay más eventos extra. Simple y directo.

    copyIconContainer.innerHTML = iconCopy;
    getUfValue(); // Llama a la API al cargar la página.
});
