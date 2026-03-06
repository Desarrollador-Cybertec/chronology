import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineClipboardDocumentCheck,
  HiOutlineArrowUpTray,
  HiOutlineCog6Tooth,
  HiOutlineUserPlus,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineChartBar,
} from 'react-icons/hi2';

const icon = (Icon: React.ComponentType<{ className?: string }>) => <Icon className="h-6 w-6" />;

export const managerSteps = [
  {
    title: 'Panel principal',
    description: 'Aquí verás un resumen rápido: empleados totales, presentes, tardanzas y el estado de la última importación. También puedes subir un archivo CSV directamente.',
    icon: icon(HiOutlineHome),
  },
  {
    title: 'Importar marcajes',
    description: 'Sube el archivo CSV del biométrico con las columnas "ID de persona" y "Hora". El sistema procesará los marcajes automáticamente y generará los registros de asistencia.',
    icon: icon(HiOutlineArrowUpTray),
  },
  {
    title: 'Consultar empleados',
    description: 'Revisa la lista de empleados, su departamento, cargo y estado. Haz clic en el nombre para ver su detalle con turnos asignados y excepciones.',
    icon: icon(HiOutlineUsers),
  },
  {
    title: 'Ver turnos',
    description: 'Consulta los turnos configurados: horarios de entrada/salida, tolerancias, almuerzo y reglas de horas extra.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Revisar asistencia',
    description: 'Filtra la asistencia por empleado, fechas o estado. Verás entradas, salidas, minutos trabajados, tardanzas y horas extra de cada registro.',
    icon: icon(HiOutlineClipboardDocumentCheck),
  },
  {
    title: 'Filtros de asistencia',
    description: 'Usa los filtros por ID de empleado, rango de fechas y estado (presente, ausente, incompleto, descanso, feriado) para encontrar registros específicos.',
    icon: icon(HiOutlineFunnel),
  },
];

export const adminSteps = [
  {
    title: 'Panel principal',
    description: 'Tu centro de control. Ve KPIs del día, sube archivos CSV directamente y accede rápidamente a todas las secciones del sistema.',
    icon: icon(HiOutlineChartBar),
  },
  {
    title: 'Importar y reprocesar',
    description: 'Sube CSVs del biométrico. Como administrador, también puedes reprocesar batches anteriores para recalcular la asistencia (sin afectar ediciones manuales).',
    icon: icon(HiOutlineArrowUpTray),
  },
  {
    title: 'Gestionar empleados',
    description: 'Crea, edita y activa/desactiva empleados. Desde el detalle de cada empleado puedes asignar turnos y ver sus excepciones de horario.',
    icon: icon(HiOutlineUsers),
  },
  {
    title: 'Asignar turnos',
    description: 'Desde el detalle de un empleado, asigna turnos seleccionando los días laborables y fechas de vigencia. Puedes tener múltiples asignaciones por empleado.',
    icon: icon(HiOutlineUserPlus),
  },
  {
    title: 'Configurar turnos',
    description: 'Crea y edita turnos con: horarios, cruza medianoche, almuerzo (inicio, fin, duración), tolerancia, horas extra habilitadas con bloque mínimo y máximo diario.',
    icon: icon(HiOutlineClock),
  },
  {
    title: 'Excepciones de horario',
    description: 'Las excepciones de horario permiten marcar días especiales (feriados, permisos, días extra) que anulan el turno regular de un empleado.',
    icon: icon(HiOutlineCalendarDays),
  },
  {
    title: 'Editar asistencia',
    description: 'Corrige registros de asistencia indicando el motivo. Cada cambio queda en el historial de ediciones para auditoría y trazabilidad.',
    icon: icon(HiOutlinePencilSquare),
  },
  {
    title: 'Detalle de asistencia',
    description: 'Consulta el desglose completo: marcajes, minutos trabajados, tardanza, salida temprana, horas extra diurnas/nocturnas e historial de ediciones manuales.',
    icon: icon(HiOutlineDocumentMagnifyingGlass),
  },
  {
    title: 'Configuración del sistema',
    description: 'Ajusta: ventana de ruido (filtro de marcajes duplicados), auto-asignación de turno, márgenes de almuerzo, horarios diurno/nocturno y retención de datos.',
    icon: icon(HiOutlineCog6Tooth),
  },
];
