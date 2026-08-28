type Regla = (valor: unknown) => true | string

const vacio = (valor: unknown) =>
  valor === null || valor === undefined || String(valor).trim() === ''

export const requerido =
  (campo = 'Este campo'): Regla =>
  (valor) =>
    !vacio(valor) || `${campo} es obligatorio.`

export const soloEnteros =
  (campo = 'El valor'): Regla =>
  (valor) =>
    vacio(valor) || /^\d+$/.test(String(valor).trim()) || `${campo} debe ser un número entero.`

export const entre =
  (min: number, max: number, campo = 'El valor'): Regla =>
  (valor) => {
    if (vacio(valor)) return true
    const numero = Number(valor)
    return (
      (Number.isFinite(numero) && numero >= min && numero <= max) ||
      `${campo} debe estar entre ${min} y ${max}.`
    )
  }

export const mayorQueCero =
  (campo = 'El valor'): Regla =>
  (valor) => {
    if (vacio(valor)) return true
    const numero = Number(valor)
    return (Number.isFinite(numero) && numero > 0) || `${campo} debe ser mayor a cero.`
  }

export const importeValido: Regla = (valor) => {
  if (vacio(valor)) return true
  return (
    /^\d+(\.\d{1,2})?$/.test(String(valor).trim()) ||
    'Usa un importe con máximo dos decimales (ej. 45.00).'
  )
}

export const longitudMinima =
  (min: number, campo = 'Este campo'): Regla =>
  (valor) =>
    vacio(valor) ||
    String(valor).trim().length >= min ||
    `${campo} debe tener al menos ${min} caracteres.`

export const longitudMaxima =
  (max: number, campo = 'Este campo'): Regla =>
  (valor) =>
    vacio(valor) ||
    String(valor).trim().length <= max ||
    `${campo} no puede exceder ${max} caracteres.`
