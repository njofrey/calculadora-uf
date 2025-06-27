document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    
    const copyIconWrapper = document.getElementById('icon-copy-wrapper');
    const checkIconWrapper = document.getElementById('icon-check-wrapper');
    const copyTextElement = document.getElementById('copy-text');

    let ufRate = 0;

    // Íconos
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

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

    resultBox.addEventListener('click', () => {
        // Evitar múltiples clicks si la animación está en curso
        if (resultBox.classList.contains('is-copying')) return;

        const rawValue = resultBox.dataset.rawValue;
        if (!rawValue) return;

        const numberToCopy = parseInt(rawValue, 10).toString();
        navigator.clipboard.writeText(numberToCopy).then(() => {
            
            // Activar el estado de copiado
            copyTextElement.textContent = 'Copiado';
            resultBox.classList.add('is-copying');
            
            // Revertir todo al estado normal después de 1.5 segundos
            setTimeout(() => {
                resultBox.classList.remove('is-copying');
                // Limpiar el texto después para que la transición de opacidad termine
                setTimeout(() => {
                    copyTextElement.textContent = '';
                }, 300);
            }, 1500);

        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    // --- INICIALIZACIÓN ---
    ufInputElement.addEventListener('input', calculate);
    copyIconWrapper.innerHTML = iconCopy;
    checkIconWrapper.innerHTML = iconCheck;
    getUfValue();
});
