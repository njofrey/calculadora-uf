document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    const copyTextElement = document.getElementById('copy-text'); // Elemento para el texto "Copiado"
    let ufRate = 0;

    // 1. Íconos como SVG (¡con el ícono clásico de copiar!)
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.353-.026.715-.026 1.068 0 1.13.094 1.976 1.057 1.976 2.192V7.5m-9.75 0h9.75M9 11.25H7.5a2.25 2.25 0 0 0-2.25 2.25V19.5a2.25 2.25 0 0 0 2.25 2.25h9.75a2.25 2.25 0 0 0 2.25-2.25V13.5a2.25 2.25 0 0 0-2.25-2.25H9.75" /></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

    // --- FUNCIÓN PARA OBTENER EL VALOR DE LA UF ---
    async function getUfValue() {
        try {
            const response = await fetch('https://mindicador.cl/api/uf');
            if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');
            
            const data = await response.json();
            ufRate = data.serie[0].valor;
            
            const today = new Date();
            const dateOptions = { day: 'numeric', 'month': 'long', year: 'numeric' };
            const formattedDate = today.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            
            const ufDisplayHtml = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
            ufDisplayElement.innerHTML = ufDisplayHtml;

            // UX Improvement: Set default value to 1 if input is empty
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

    // --- LÓGICA DE COPIADO MEJORADA ---
    resultBox.addEventListener('click', () => {
        const rawValue = resultBox.dataset.rawValue;
        // Evita múltiples clicks si ya está en estado "copiado"
        if (!rawValue || resultBox.classList.contains('copied')) return; 

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            // Feedback visual: cambia ícono, muestra texto y anima la caja
            copyIconContainer.innerHTML = iconCheck;
            copyTextElement.textContent = 'Copiado';
            copyTextElement.classList.add('visible');
            resultBox.classList.add('copied');
            
            // Revertir después de un momento
            setTimeout(() => {
                copyIconContainer.innerHTML = iconCopy;
                copyTextElement.classList.remove('visible');
                resultBox.classList.remove('copied');
                // Opcional: limpiar el texto para una transición más suave la próxima vez
                setTimeout(() => { copyTextElement.textContent = ''; }, 300);
            }, 1500); // Aumentamos un poco el tiempo para que se lea bien
        }).catch(err => {
            console.error('Error al copiar: ', err);
            copyTextElement.textContent = 'Error'; // Informar al usuario si falla
            copyTextElement.classList.add('visible');
        });
    });

    // --- INICIALIZACIÓN ---
    ufInputElement.addEventListener('input', calculate);
    copyIconContainer.innerHTML = iconCopy; // Poner el ícono de copiar al inicio
    getUfValue();
});
