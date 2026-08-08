# Calculadora UF a CLP

Conversor de Unidades de Fomento (UF) a Pesos Chilenos (CLP) con el valor del día.

## Funcionalidades

- Conversión en tiempo real mientras escribes
- Valor de la UF actualizado diariamente vía [mindicador.cl](https://mindicador.cl)
- Selector de fecha para consultar la UF de cualquier día desde 2013
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

- **`api/uf.js`** — Serverless function que consulta mindicador.cl y cachea la respuesta en el CDN de Vercel. El valor del día usa `s-maxage=3600` + `stale-while-revalidate=86400`; si mindicador todavía no publica el valor de hoy, baja a `s-maxage=300` para reintentar pronto. Acepta `?fecha=DD-MM-YYYY` para días pasados, que se cachean una semana porque ya no cambian.
- **Cron job** — Corre a las 03:05 y 04:05 UTC, o sea recién pasada la medianoche en Chile en verano y en invierno. La UF cambia a medianoche, así que el cache se refresca justo cuando el valor cambia. (Antes corría a las 11:00 UTC, siete horas tarde.)
- **localStorage** — Guarda el valor del día para carga instantánea en visitas recurrentes. Solo se guarda si la fecha del dato coincide con el día actual **en Chile**, para no dejar pegado el valor de ayer.

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
