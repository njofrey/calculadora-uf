document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del HTML
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    let ufRate = 0;

    // --- FUNCIÓN PARA OBTENER EL VALOR DE LA UF (ACTUALIZADA CON NUEVO FORMATO) ---
    async function getUfValue() {
        try {
            const response = await fetch('https://mindicador.cl/api/uf');
            if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');
            
            const data = await response.json();
            ufRate = data.serie[0].valor;
            
            // 1. Lógica para mostrar la fecha en el formato solicitado
            const today = new Date();
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = today.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            
            // Se crea el HTML con la nueva estructura
            const ufDisplayHtml = `
                <span>UF hoy = <strong>${formattedUf}</strong></span>
                <div class="uf-date">${formattedDate}</div>
            `;
            ufDisplayElement.innerHTML = ufDisplayHtml;

            calculate();

        } catch (error) {
            ufDisplayElement.textContent = 'Error al cargar valor de la UF.';
            console.error(error);
        }
    }

    // --- FUNCIÓN PARA CALCULAR Y MOSTRAR EL RESULTADO ---
    function calculate() {
        if (ufRate === 0) return;

        const ufAmount = parseFloat(ufInputElement.value) || 0;
        const totalClp = ufAmount * ufRate;
        
        clpResultElement.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(totalClp);
        
        clpResultElement.dataset.rawValue = totalClp;
    }

    // --- FUNCIÓN PARA COPIAR (MENSAJE CORREGIDO) ---
    clpResultElement.addEventListener('click', () => {
        const rawValue = clpResultElement.dataset.rawValue;
        if (!rawValue) return;

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy)
            .then(() => {
                const originalText = clpResultElement.textContent;
                // 2. Mensaje de copiado corregido
                clpResultElement.textContent = 'Copiado!';
                setTimeout(() => {
                    clpResultElement.textContent = originalText;
                }, 1200);
            })
            .catch(err => {
                console.error('Error al copiar el texto: ', err);
            });
    });

    // Escuchar cambios en el input para recalcular
    ufInputElement.addEventListener('input', calculate);

    // Cargar el valor de la UF al iniciar la página
    getUfValue();
});
