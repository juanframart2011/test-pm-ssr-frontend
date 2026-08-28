const monedaMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const fechaLarga = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'long',
  timeStyle: 'short',
})

/** `"45.00"` → `"$45.00"`. Devuelve un guion largo si el valor no es numérico. */
export function formatoImporte(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  const numero = typeof valor === 'number' ? valor : Number(valor)
  return Number.isFinite(numero) ? monedaMXN.format(numero) : String(valor)
}

/** ISO → `"17 de mayo de 2024, 23:03"`. */
export function formatoFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? String(iso) : fechaLarga.format(fecha)
}

/** Convierte una fecha a `YYYY-MM-DD` para inputs de tipo date. */
export function aFechaInput(iso: string | Date = new Date()): string {
  const fecha = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(fecha.getTime())) return ''
  const offset = fecha.getTimezoneOffset() * 60_000
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10)
}

/** `16`, `20` → `"Del día 16 al 20"`. */
export function formatoRangoDias(inicio?: string | null, fin?: string | null): string {
  if (!inicio && !fin) return '—'
  if (inicio && fin) return `Del día ${inicio} al ${fin}`
  return `Día ${inicio ?? fin}`
}

/** Texto por defecto para campos vacíos o nulos. */
export function oGuion(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '—'
  const texto = String(valor).trim()
  return texto === '' ? '—' : texto
}
