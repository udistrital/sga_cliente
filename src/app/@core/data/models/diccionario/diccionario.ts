export const VIEWS = Object.freeze({
    LIST: Symbol(),
    FORM: Symbol(),
})

export const MODALS = Object.freeze({
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
    QUESTION: 'question',
})

export const ACTIONS = Object.freeze({
    VIEW: Symbol(),
    EDIT: Symbol(),
    DELETE: Symbol(),
    CREATE: Symbol(),
    SEND: Symbol(),
})

export const ROLES = Object.freeze({
    ADMIN_SGA: 'ADMIN_SGA',
    VICERRECTOR: 'VICERRECTOR',
    ASESOR_VICE: 'ASESOR_VICE',
    COORDINADOR: 'COORDINADOR',
    COORDINADOR_PREGADO: 'COORDINADOR_PREGADO',
    COORDINADOR_POSGRADO: 'COORDINADOR_POSGRADO',
    ESTUDIANTE: 'ESTUDIANTE',
    ASISTENTE_ADMISIONES: 'ASISTENTE_ADMISIONES',
    ADMIN_DOCENCIA: 'ADMIN_DOCENCIA',
    DOCENTE: 'DOCENTE',
    ASIS_PROYECTO: 'ASIS_PROYECTO'
})