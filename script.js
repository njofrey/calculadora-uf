document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del HTML
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    let ufRate = 0;

    // --- FUNCIÓN PARA OBTENER EL VALOR DE LA UF (ACTUALIZADA CON FECHA) ---
    async function getUfValue() {
        try {
            const response = await fetch('https://mindicador.cl/api/uf');
            if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');
            
            const data = await response.json();
            ufRate = data.serie[0].valor;
            
            // 1. Lógica para mostrar la fecha
            const today = new Date();
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = today.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            
            // Se crea el texto con la fecha y el valor
            ufDisplayElement.innerHTML = `UF hoy (${formattedDate}): <strong>${formattedUf}</strong>`;

            calculate();

        } catch (error) {
            ufDisplayElement.textContent = 'Error al cargar valor de la UF.';
            console.error(error);
        }
    }

    // --- FUNCIÓN PARA CALCULAR Y MOSTRAR EL RESULTADO (ACTUALIZADA) ---
    function calculate() {
        if (ufRate === 0) return;

        const ufAmount = parseFloat(ufInputElement.value) || 0;
        const totalClp = ufAmount * ufRate;
        
        // Formatear el resultado en pesos chilenos
        clpResultElement.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0 // Mostramos el CLP como entero
        }).format(totalClp);
        
        // Guardamos el valor numérico en el elemento para poder copiarlo después
        clpResultElement.dataset.rawValue = totalClp;
    }

    // --- 2. NUEVA FUNCIÓN PARA COPIAR AL PORTAPAPELES ---
    clpResultElement.addEventListener('click', () => {
        const rawValue = clpResultElement.dataset.rawValue;
        if (!rawValue) return; // No hacer nada si no hay valor

        // Copiamos el número entero
        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy)
            .then(() => {
                // Feedback visual para el usuario
                const originalText = clpResultElement.textContent;
                clpResultElement.textContent = '¡Copiado!';
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
