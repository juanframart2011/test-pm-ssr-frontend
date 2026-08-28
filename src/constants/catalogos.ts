import type { CatalogoItem } from '@/types/tarifa'

/**
 * Catálogos del formulario de alta.
 * El API no expone (aún) un endpoint de catálogos, así que se definen aquí con los
 * valores observados en el response; al existir el servicio basta con sustituir el
 * origen de estos arreglos sin tocar el formulario.
 */
export const ESTATUS: CatalogoItem[] = [
  { id: 1, descripcion: 'Activa' },
  { id: 2, descripcion: 'Inactiva' },
  { id: 3, descripcion: 'Pendiente de autorización' },
]

export const TIPOS_DOCUMENTO: CatalogoItem[] = [
  { id: 1, descripcion: 'Original' },
  { id: 2, descripcion: 'Copia' },
  { id: 3, descripcion: 'Digitalizado' },
]

export const TIPOS_PRODUCTO: CatalogoItem[] = [
  { id: 1, descripcion: 'Guarda física' },
  { id: 2, descripcion: 'Guarda digital' },
  { id: 3, descripcion: 'Custodia de valores' },
]

export const APLICATIVOS: CatalogoItem[] = [
  { id: 1, descripcion: 'BO-Aguila' },
  { id: 2, descripcion: 'BO-Halcon' },
  { id: 4, descripcion: 'BO-Linces' },
  { id: 7, descripcion: 'FO-Portal' },
]
