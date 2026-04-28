import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCog6Tooth,
  HiOutlineUserPlus,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineChartBar,
  HiOutlineArrowPath,
  HiOutlineTableCells,
  HiOutlineEye,
  HiOutlinePower,
  HiOutlineDocumentArrowUp,
  HiOutlineListBullet,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { icon } from '@/utils/icons';

/* ── Manager tutorial (10 steps) ── */
export const managerSteps = [
  {
    title: 'Panel principal — Tu centro de control',
    description: 'Al entrar verás 4 tarjetas de resumen: total de empleados, reincidentes de tardanza, total de tardanzas y el estado de la última importación. Debajo hay una zona de "Importar CSV rápido" donde puedes arrastrar o seleccionar un archivo sin ir a otra página.',
    icon: icon(HiOutlineHome),
  },
  {
    title: 'Reincidentes de tardanza en el Dashboard',
    description: 'En la parte inferior del Dashboard se muestra una tabla de reincidentes de tardanza: empleados con 2 o más tardanzas. Muestra nombre, Días tarde, total de minutos, promedio y última fecha de tardanza. Haz clic en "Ver todo" para abrir la lista completa de asistencia con tardanzas.',
    icon: icon(HiOutlineClipboardDocumentCheck),
  },
  {
    title: 'Importar marcajes del biométrico',
    description: 'Ve a "Importar CSV" en el menú lateral. Arrastra tu archivo o haz clic en la zona punteada para seleccionarlo. El CSV debe tener columnas "ID de persona" y "Hora", con máximo 10 MB. Al subir, el sistema procesa los marcajes automáticamente y genera registros de asistencia.',
    icon: icon(HiOutlineDocumentArrowUp),
  },
  {
    title: 'Historial de importaciones',
    description: 'Debajo de la zona de subida verás todas las importaciones realizadas con: nombre del archivo, total de filas, filas procesadas, filas con error y estado (pendiente, procesando, completado, fallido). Haz clic en "Ver" para obtener el detalle y la lista de errores de cada importación.',
    icon: icon(HiOutlineListBullet),
  },
  {
    title: 'Lista de empleados',
    description: 'La sección "Empleados" muestra una tabla con: ID interno, nombre completo (clic para ver detalle), departamento, cargo y estado (activo/inactivo). Usa la paginación al final para navegar entre páginas. Haz clic en "Ver" en cualquier fila para acceder al perfil completo del empleado.',
    icon: icon(HiOutlineUsers),
  },
  {
    title: 'Detalle de un empleado',
    description: 'Al abrir un empleado verás su información (ID, departamento, cargo, estado), las asignaciones de turno activas (turno, fecha inicio/fin, días laborables), las excepciones de horario (feriados, permisos) y un enlace a su asistencia completa.',
    icon: icon(HiOutlineEye),
  },
  {
    title: 'Lista de turnos',
    description: 'En "Turnos" se listan todos los turnos configurados con: nombre, horario de entrada/salida (indica "nocturno" si cruza medianoche), tolerancia en minutos, bloques de descanso (cantidad y duración), si tiene horas extra habilitadas y estado activo/inactivo.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Buscar asistencia con filtros',
    description: 'La página "Asistencia" tiene una barra de filtros arriba: selecciona un empleado del listado desplegable, elige un rango de fechas (desde-hasta) y un estado (presente, ausente, incompleto, descanso, feriado). Haz clic en "Filtrar" para aplicar. Los filtros se reflejan en la URL para compartir búsquedas.',
    icon: icon(HiOutlineFunnel),
  },
  {
    title: 'Tabla de asistencia',
    description: 'Cada registro de asistencia muestra: fecha, nombre del empleado (enlace a su perfil), hora de entrada y salida, minutos trabajados, tardanza (en rojo), horas extra (en verde), estado con badge y un ícono ✎ si fue editado manualmente. Haz clic en "Ver" para el desglose completo.',
    icon: icon(HiOutlineTableCells),
  },
  {
    title: 'Detalle de un registro de asistencia',
    description: 'La vista de detalle muestra 3 secciones: datos del empleado y turno, marcajes (primera entrada, última salida, minutos trabajados) y cálculos (tardanza, salida temprana, horas extra totales/diurnas/nocturnas, estado). Si se editó manualmente, verás el historial de cambios: campo, valor anterior, valor nuevo, motivo, editor y fecha.',
    icon: icon(HiOutlineDocumentMagnifyingGlass),
  },
];

/* ── Admin tutorial (16 steps) ── */
export const adminSteps = [
  {
    title: 'Panel principal — Centro de administración',
    description: 'El Dashboard muestra 4 KPIs: empleados totales, reincidentes de tardanza, total de tardanzas y estado de la última importación. Debajo hay una zona de "Importar CSV rápido" para arrastrar archivos directo sin necesidad de ir a la sección de importaciones.',
    icon: icon(HiOutlineChartBar),
  },
  {
    title: 'Reincidentes de tardanza desde el Dashboard',
    description: 'La tabla inferior del Dashboard muestra los empleados con tardanzas recurrentes (2 o más): nombre, Días tarde, total de minutos, promedio y última tardanza. Haz clic en "Ver todo" para ir a la lista completa de asistencia con tardanzas, o en "Ver perfil" para ir al detalle del empleado.',
    icon: icon(HiOutlineClipboardDocumentCheck),
  },
  {
    title: 'Subir CSV del biométrico',
    description: 'En "Importar CSV" arrastra un archivo a la zona punteada o haz clic para seleccionarlo. El formato esperado es CSV con columnas "ID de persona" y "Hora", máximo 10 MB. Al completar la subida, el sistema comienza a procesar los marcajes y crear registros de asistencia automáticamente.',
    icon: icon(HiOutlineDocumentArrowUp),
  },
  {
    title: 'Reprocesar importaciones',
    description: 'Como administrador, en el historial de importaciones puedes hacer clic en "Reprocesar" en batches con estado "Completado". Esto elimina los registros de asistencia (que no hayan sido editados manualmente) y los recalcula desde los marcajes originales. Ideal si cambias configuraciones de turnos.',
    icon: icon(HiOutlineArrowPath),
  },
  {
    title: 'Detalle de una importación',
    description: 'Haz clic en "Ver" en cualquier importación para revisar: archivo original, total de filas, filas procesadas, fecha de procesamiento, estado y la lista detallada de errores (si hay filas con problemas). Úsalo para diagnosticar importaciones fallidas.',
    icon: icon(HiOutlineListBullet),
  },
  {
    title: 'Gestionar empleados',
    description: 'En "Empleados" tienes la tabla completa con ID interno, nombre, departamento, cargo y estado. Como admin puedes: hacer clic en "Editar" para modificar datos, o usar "Activar/Desactivar" para cambiar el estado de un empleado sin eliminarlo del sistema.',
    icon: icon(HiOutlineUsers),
  },
  {
    title: 'Editar datos de un empleado',
    description: 'Desde la lista o desde el detalle, haz clic en "Editar". Podrás modificar: nombre, apellido, departamento y cargo. Los cambios se guardan y puedes volver al detalle del empleado desde el botón "Cancelar" o al guardar.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Activar o desactivar empleados',
    description: 'En la lista de empleados, el botón "Desactivar" cambia el estado a inactivo (y viceversa). Los empleados inactivos no generan registros de asistencia al importar marcajes, pero sus datos históricos se conservan intactos.',
    icon: icon(HiOutlinePower),
  },
  {
    title: 'Asignar turnos a empleados',
    description: 'Desde el detalle de un empleado, haz clic en "+ Asignar". Selecciona un turno del listado (muestra nombre + horario), indica fecha de inicio, fecha fin opcional y selecciona los días laborables con los botones Lun-Dom (por defecto Lun a Vie). Un empleado puede tener múltiples asignaciones vigentes.',
    icon: icon(HiOutlineUserPlus),
  },
  {
    title: 'Crear y configurar turnos',
    description: 'En "Turnos" haz clic en "Nuevo turno". Completa: nombre, hora de entrada/salida, tolerancia (min), si cruza medianoche, bloques de descanso (tipo, inicio, fin — puedes agregar múltiples), si tiene horas extra habilitadas (bloque mínimo y máximo diario) y si está activo. Usa "Editar" en turnos existentes para modificar la configuración.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Excepciones de horario',
    description: 'En el detalle de cada empleado verás sus excepciones: feriados, permisos, y días extra que anulan el turno regular. Cada excepción muestra la fecha, el tipo (con badge de color), el turno alternativo si aplica, y el motivo. Las excepciones se reflejan automáticamente en los cálculos de asistencia.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Filtros avanzados de asistencia',
    description: 'En la página "Asistencia" usa la barra de filtros: selecciona un empleado del listado desplegable, elige un rango de fechas con los campos "desde" y "hasta", selecciona un estado específico (presente, ausente, incompleto, descanso, feriado) y haz clic en "Filtrar". Los filtros se guardan en la URL para que puedas compartir la búsqueda.',
    icon: icon(HiOutlineFunnel),
  },
  {
    title: 'Editar registros de asistencia',
    description: 'En la tabla de asistencia, haz clic en "Editar" en cualquier registro. Puedes corregir: hora de entrada, hora de salida, minutos trabajados, tardanza, salida temprana, horas extra (total, diurnas, nocturnas), estado y DEBES indicar un motivo de edición. Cada cambio queda en el historial de auditoría.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Historial de ediciones y auditoría',
    description: 'Cuando un registro ha sido editado manualmente, aparece con el ícono ✎ en la lista. En el detalle del registro verás la sección "Historial de ediciones" con: campo modificado, valor anterior, valor nuevo, motivo que escribió el editor, nombre del usuario que hizo el cambio y fecha/hora exacta.',
    icon: icon(HiOutlineShieldCheck),
  },
  {
    title: 'Detalle completo de asistencia',
    description: 'Haz clic en "Ver" en cualquier registro para el desglose: información del empleado y turno, marcajes (primera entrada y última salida), minutos trabajados, y cálculos detallados (tardanza, salida temprana, horas extra totales/diurnas/nocturnas con el formato horas y minutos, estado con badge).',
    icon: icon(HiOutlineDocumentMagnifyingGlass),
  },
  {
    title: 'Configuración del sistema',
    description: 'En "Configuración" ajusta los parámetros globales: ventana de ruido (para filtrar marcajes duplicados cercanos), auto-asignación de turno (habilitar/deshabilitar), tolerancia y regularidad de auto-asignación, inicio del período diurno, inicio del nocturno y meses de retención de datos históricos.',
    icon: icon(HiOutlineCog6Tooth),
  },
];
