# Calculadora UF a CLP

Conversor de Unidades de Fomento (UF) a Pesos Chilenos (CLP) con el valor del día.

## Funcionalidades

- Conversión en tiempo real mientras escribes
- Valor de la UF actualizado diariamente vía [mindicador.cl](https://mindicador.cl)
- Copia el resultado al portapapeles con un click
- Formato numérico chileno (puntos como separador de miles, coma decimal)

## Arquitectura

```
Usuario abre la página
        │
        ▼
  localStorage cache ──→ Muestra valor instantáneo (0ms)
        │
        ▼
  /api/uf (Vercel CDN) ──→ Actualiza valor (~50ms)
        │
        ▼
  mindicador.cl (fallback) ──→ Solo si el proxy falla
```

- **`api/uf.js`** — Serverless function que consulta mindicador.cl y cachea la respuesta en el CDN de Vercel (`s-maxage=3600`, `stale-while-revalidate=86400`)
- **Cron job** — Se ejecuta diariamente a las 8:00 AM (hora Chile) para pre-calentar el cache del CDN
- **localStorage** — Guarda el último valor consultado para carga instantánea en visitas recurrentes

## Stack

- HTML / CSS / JavaScript (vanilla)
- Vercel (hosting + serverless functions + cron)
- [mindicador.cl](https://mindicador.cl) (fuente de datos, Banco Central de Chile)

## Desarrollo local

```bash
npx vercel login
npx vercel dev
```

Abre `http://localhost:3000`

## Deploy

Push a `main` → Vercel despliega automáticamente.
