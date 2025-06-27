document.addEventListener('DOMContentLoaded', () => {
  const ufDisplayElement = document.getElementById('uf-display');
  const ufInputElement = document.getElementById('uf-input');
  const clpResultElement = document.getElementById('clp-result');
  const resultBox = document.getElementById('result-box');
  const copyTextElement = document.getElementById('copy-text');
  let ufRate = 0;

  async function getUfValue() {
    try {
      const response = await fetch('https://mindicador.cl/api/uf');
      if (!response.ok) throw new Error('No se pudo obtener el valor de la UF.');

      const data = await response.json();
      ufRate = data.serie[0].valor;

      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
      const formattedUf = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(ufRate);

      ufDisplayElement.innerHTML = `<span>UF hoy = <strong>${formattedUf}</strong></span><div class="uf-date">${formattedDate}</div>`;

      if (!ufInputElement.value) ufInputElement.value = 1;

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
        copyTextElement.textContent = '';
      }, 1500);
    }).catch(err => {
      console.error('Error al copiar: ', err);
      copyTextElement.textContent = 'Error';
      copyTextElement.classList.add('visible');
    });
  });

  ufInputElement.addEventListener('input', calculate);
  getUfValue();
});
