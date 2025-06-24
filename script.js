document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const datePicker = document.getElementById('date-picker'); // Calendario
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    let ufRate = 0;

    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" /></svg>`;
    const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

    // --- FUNCIÓN PARA OBTENER EL VALOR DE LA UF (AHORA ACEPTA UNA FECHA) ---
    async function getUfValue(dateString = null) {
        let apiUrl = 'https://mindicador.cl/api/uf';
        if (dateString) {
            apiUrl += `/${dateString}`;
        }
        
        ufDisplayElement.innerHTML = 'Cargando valor...';

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('No hay datos para esta fecha.');
            
            const data = await response.json();
            
            // La API devuelve un array vacío si no hay datos
            if (data.serie.length === 0) {
                 throw new Error('No hay valor de UF para la fecha seleccionada.');
            }

            ufRate = data.serie[0].valor;
            const fetchedDate = new Date(data.serie[0].fecha);
            
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
            const formattedDate = fetchedDate.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            
            const ufDisplayHtml = `<span>UF el ${dateString ? '' : '<strong>hoy</strong>'} = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
            ufDisplayElement.innerHTML = ufDisplayHtml;

            calculate();

        } catch (error) {
            ufDisplayElement.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
            ufRate = 0; // Resetear la tasa si hay error
            calculate(); // Recalcular a 0
        }
    }

    // --- FUNCIÓN PARA CALCULAR ---
    function calculate() {
        if (ufRate === 0) {
            clpResultElement.textContent = '$0';
            resultBox.dataset.rawValue = '0';
            return;
        }

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
        if (!rawValue || parseFloat(rawValue) === 0) return;

        const numberToCopy = parseInt(rawValue, 10).toString();

        navigator.clipboard.writeText(numberToCopy).then(() => {
            copyIconContainer.innerHTML = iconCheck;
            resultBox.classList.add('copied');
            
            setTimeout(() => {
                copyIconContainer.innerHTML = iconCopy;
                resultBox.classList.remove('copied');
            }, 1200);
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    });

    // --- LÓGICA DEL CALENDARIO ---
    datePicker.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        if (selectedDate) {
            // Formato DD-MM-YYYY que requiere la API
            const [year, month, day] = selectedDate.split('-');
            const formattedApiDate = `${day}-${month}-${year}`;
            getUfValue(formattedApiDate);
        } else {
            // Si el usuario borra la fecha, volver al valor de hoy
            getUfValue();
        }
    });

    // --- INICIALIZACIÓN ---
    ufInputElement.addEventListener('input', calculate);
    copyIconContainer.innerHTML = iconCopy;
    getUfValue(); // Cargar valor de hoy al iniciar
});
