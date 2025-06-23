document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    let ufRate = 0;

    // 1. Íconos como SVG para control total
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" /></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

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
            
            const ufDisplayHtml = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
            ufDisplayElement.innerHTML = ufDisplayHtml;

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

    // --- 3. LÓGICA DE COPIADO MEJORADA ---
    resultBox.addEventListener('click', () => {
        const rawValue = resultBox.dataset.rawValue;
        if (!rawValue) return;

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            // Feedback visual: cambia el ícono y anima la caja
            copyIconContainer.innerHTML = iconCheck;
            resultBox.classList.add('copied');
            
            // Revertir después de un momento
            setTimeout(() => {
                copyIconContainer.innerHTML = iconCopy;
                resultBox.classList.remove('copied');
            }, 1200);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    // --- INICIALIZACIÓN ---
    ufInputElement.addEventListener('input', calculate);
    copyIconContainer.innerHTML = iconCopy; // Poner el ícono de copiar al inicio
    getUfValue();
});
