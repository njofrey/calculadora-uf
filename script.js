document.addEventListener('DOMContentLoaded', () => {
    const ufValueElement = document.getElementById('uf-value');
    const ufInputElement = document.getElementById('uf-input');
    const clpResultElement = document.getElementById('clp-result');
    let ufRate = 0;

    // Función para obtener el valor de la UF desde la API
    async function getUfValue() {
        try {
            const response = await fetch('https://mindicador.cl/api/uf');
            if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');
            const data = await response.json();
            ufRate = data.serie[0].valor;
            
            // Formatear para mostrar en la UI
            const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);
            ufValueElement.textContent = formattedUf;

            // Disparar el cálculo inicial si hay un valor en el input
            calculate();

        } catch (error) {
            ufValueElement.textContent = 'Error al cargar';
            console.error(error);
        }
    }

    // Función para calcular y mostrar el resultado
    function calculate() {
        if (ufRate === 0) return; // No calcular si aún no tenemos el valor de la UF

        const ufAmount = parseFloat(ufInputElement.value) || 0;
        const totalClp = ufAmount * ufRate;
        
        // Formatear el resultado en pesos chilenos
        clpResultElement.textContent = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(totalClp);
    }

    // Escuchar cambios en el input para recalcular en tiempo real
    ufInputElement.addEventListener('input', calculate);

    // Cargar el valor de la UF al iniciar la página
    getUfValue();
});