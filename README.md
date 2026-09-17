# Calculadora UF a CLP

Calculadora web para convertir Unidades de Fomento (UF) a pesos chilenos (CLP) usando el valor diario publicado por [mindicador.cl](https://mindicador.cl).

**Producción:** [calculadora-uf.vercel.app](https://calculadora-uf.vercel.app/)

## Funcionalidades

- Conversión instantánea mientras se escribe.
- Formato numérico chileno: `1.000,5`.
- Permite escribir o pegar cifras como `14700` o `17.000`: el punto separa miles y solo la coma introduce decimales.
- Resultado redondeado a pesos y copiable al portapapeles.
- Muestra el valor de la UF y la fecha correspondiente.
- Conserva el último valor válido para evitar una pantalla vacía.
- Actualiza el dato en segundo plano y señala claramente si el valor mostrado es anterior.

## Carga y actualización de la UF

```text
Usuario abre la página
        │
        ├── Caché local disponible ──→ muestra el valor inmediatamente
        │
        └── Primera visita
                │
                ├── /api/uf (CDN de Vercel) ──┐
                │                              ├── usa la primera respuesta válida
                └── mindicador.cl ─────────────┘
                                               │
                                               └── adopta después el dato más reciente
```

El navegador consulta el proxy y la fuente directa en paralelo, con un límite de cuatro segundos por solicitud. Esto evita esperar a que una ruta falle antes de iniciar la otra.

El último dato válido se guarda en `localStorage`. Al comenzar un nuevo día, se muestra de inmediato con su fecha mientras se obtiene el valor actualizado.

## Caché del servidor

[`api/uf.js`](api/uf.js) consulta mindicador.cl y almacena la respuesta en el CDN de Vercel:

- Valor correspondiente al día actual: caché fresco durante una hora.
- Valor anterior aún publicado por la fuente: reintento cada cinco minutos.
- En ambos casos, Vercel puede servir el dato anterior durante 24 horas mientras revalida en segundo plano.

Un cron diario solicita `/api/uf` a las `04:05 UTC` para anticipar la actualización del caché. La comprobación de fecha usa `America/Santiago`, no la zona horaria del navegador ni la del servidor.

## Desarrollo local

Requisitos: Node.js y Vercel CLI.

```bash
npm install
npx vercel dev
```

La aplicación queda disponible normalmente en `http://localhost:3000`.

Para ejecutar las pruebas:

```bash
npm test
```

## Despliegue

La rama `main` está conectada con Vercel. Cada `push` a `main` genera automáticamente un nuevo despliegue de producción.

## Estructura

```text
.
├── api/uf.js          # Proxy serverless y política de caché
├── index.html         # Interfaz
├── input.js           # Normalización y lectura de valores UF
├── script.js          # Consulta, caché local, cálculo y copiado
├── style.css          # Estilos
├── test/              # Pruebas automatizadas
└── vercel.json        # Cabeceras y cron de Vercel
```

## Tecnologías

- HTML, CSS y JavaScript sin frameworks.
- Node.js Test Runner.
- Vercel Functions, CDN y Cron Jobs.
- mindicador.cl como fuente de la UF.
