/** Elemento de catálogo `{ id, descripcion }` usado por estatus, tipoDocumento, etc. */
export interface CatalogoItem {
  id: number
  descripcion: string
}

export interface Aplicativo {
  idAplicativo: number
  aplicativo: string
  cuotaAplicativo: string
}

/** Registro de tarifa tal como lo devuelve el API. */
export interface Tarifa {
  idTarifa: number
  tarifa: string
  concepto: string
  estatus: CatalogoItem | null
  tipoProducto: CatalogoItem | null
  tipoDocumento: CatalogoItem | null
  evento?: CatalogoItem | null
  diaInicio: string
  diaFin: string
  importe: string
  importePropuesto?: string | null
  importeAnterior?: string | null
  codigoMiscelanea?: string | null
  comentarios?: string | null
  fh_ultima_modificacion: string
  proceso_ultima_modificacion?: string | null
  usuario_ultima_modificacion?: string | null
  aplicativos: Aplicativo[]
}

/** Distingue los registros del API de los capturados localmente por el usuario. */
export type OrigenTarifa = 'api' | 'local'

export interface TarifaConOrigen extends Tarifa {
  origen: OrigenTarifa
}

export interface ConsultaTarifaRequest {
  idTarifa: string
}

export interface ConsultaTarifaResponse {
  response: {
    code: string
    mensaje: string
    idRequest: string
    tarifas: Tarifa[]
  }
}

/** Código que el API devuelve cuando la consulta fue exitosa. */
export const CODIGO_EXITO = 'EXO0001'
