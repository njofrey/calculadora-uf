body {
    font-family: 'Inter', sans-serif;
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    color: #333;
}

.card {
    background-color: white;
    padding: 30px 40px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
    max-width: 350px;
    width: 100%;
}

h1 {
    font-size: 24px;
    margin-top: 0;
}

p {
    color: #666;
    margin-bottom: 20px;
}

/* Estilo para el display de la UF */
#uf-display {
    color: #555;
    font-size: 14px;
}

.input-group {
    text-align: left;
    margin-bottom: 20px;
}

label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 8px;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 18px;
    box-sizing: border-box;
}

.result {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 8px;
    padding: 15px;
}

.result h2 {
    font-size: 16px;
    margin: 0;
    color: #036497;
}

.result p {
    font-size: 28px;
    font-weight: 700;
    margin: 5px 0 0 0;
    color: #036497;
    cursor: pointer; /* AÑADIDO: Indica que el resultado es clickeable */
    transition: background-color 0.2s ease;
}

.result p:hover {
    background-color: rgba(255,255,255,0.2); /* Efecto visual al pasar el mouse */
}
