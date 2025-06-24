document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const ufDisplayElement = document.getElementById('uf-display');
    const ufInputElement = document.getElementById('uf-input');
    const datePickerEl = document.getElementById('date-picker');
    const toggleBtn = document.getElementById('toggle-datepicker-btn');
    const datepickerContainer = document.getElementById('datepicker-container');
    const clpResultElement = document.getElementById('clp-result');
    const resultBox = document.getElementById('result-box');
    const copyIconContainer = document.getElementById('copy-icon-container');
    let ufRate = 0;

    // --- Íconos SVG ---
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" /></svg>`;
    const iconCheck = `<svg class="check" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>`;

    // --- Inicialización del Calendario Profesional ---
    const datepicker = new Datepicker(datePickerEl, {
        language: 'es',
        autohide: true,
        todayHighlight: true,
        maxDate: new Date(), // No se pueden seleccionar fechas futuras
        format: 'dd/mm/yyyy',
    });

    // --- Lógica de la App ---
    async function getUfValue(date = null) {
        let apiUrl = 'https://mindicador.cl/api/uf';
        let isToday = true;
        
        if (date) {
            // Formato DD-MM-YYYY que requiere la API
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            apiUrl += `/${day}-${month}-${year}`;
            isToday = false;
        }
        
        ufDisplayElement.innerHTML = 'Cargando...';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('No hay datos para esta fecha.');
            const data = await response.json();
            if (data.serie.length === 0) throw new Error('No hay valor para la fecha seleccionada.');

            ufRate = data.serie[0].valor;
            const fetchedDate = new Date(data.serie[0].fecha);
            
            const dateOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
            const formattedDate = fetchedDate.toLocaleDateString('es-CL', dateOptions);
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            
            const ufDisplayHtml = `<span>UF ${isToday ? 'hoy' : 'el'} = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;
            ufDisplayElement.innerHTML = ufDisplayHtml;

            calculate();
        } catch (error) {
            ufDisplayElement.innerHTML = `<span style="color: #ef4444;">${error.message}</span>`;
            ufRate = 0;
            calculate();
        }
    }

    function calculate() {
        if (ufRate === 0) {
            clpResultElement.textContent = '$0';
            resultBox.dataset.rawValue = '0';
            return;
        }
        const ufAmount = parseFloat(ufInputElement.value) || 0;
        const totalClp = ufAmount * ufRate;
        clpResultElement.textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalClp);
        resultBox.dataset.rawValue = totalClp;
    }

    // --- Event Listeners ---
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
        });
    });

    datePickerEl.addEventListener('changeDate', (event) => {
        getUfValue(event.detail.date);
        datepicker.hide();
    });

    toggleBtn.addEventListener('click', () => {
        const isVisible = datepickerContainer.classList.toggle('visible');
        toggleBtn.textContent = isVisible ? 'Ocultar calendario' : 'Consultar otra fecha';
        if (!isVisible) {
            datepicker.setDate(undefined); // Limpiar la fecha
            getUfValue(); // Volver al valor de hoy
        }
    });

    ufInputElement.addEventListener('input', calculate);
    ufInputElement.addEventListener('focus', () => ufInputElement.select()); // Seleccionar texto al hacer foco

    // --- Inicialización ---
    copyIconContainer.innerHTML = iconCopy;
    getUfValue(); // Cargar valor de hoy al iniciar
});
