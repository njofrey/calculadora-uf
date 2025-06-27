document.addEventListener('DOMContentLoaded', () => {
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    const copyTextElement = document.getElementById('copy-text');
    let ufRate = 0;

    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

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
        const rawValue = resultBox.dataset.rawValue;
        if (!rawValue || resultBox.classList.contains('copied')) return; 

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            resultBox.classList.add('copied');
            copyTextElement.textContent = 'Copiado';
            copyTextElement.classList.add('visible');

            setTimeout(() => {
                resultBox.classList.remove('copied');
                copyTextElement.classList.remove('visible');
                setTimeout(() => { copyTextElement.textContent = ''; }, 300);
            }, 1500);
        }).catch(err => {
            console.error('Error al copiar: ', err);
            copyTextElement.textContent = 'Error';
            copyTextElement.classList.add('visible');
        });
    });

    ufInputElement.addEventListener('input', calculate);
    copyIconContainer.innerHTML = iconCopy;
    getUfValue();
});
