// ── Auth ──
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'manager';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

// ── Pagination ──
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// ── Employees ──
export interface AttendanceSummary {
  total_days_worked: number;
  total_days_absent: number;
  total_days_incomplete: number;
  total_worked_minutes: number;
  total_overtime_minutes: number;
  total_overtime_diurnal_minutes: number;
  total_overtime_nocturnal_minutes: number;
  total_late_minutes: number;
  total_early_departure_minutes: number;
}

export interface Employee {
  id: number;
  internal_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  shift_assignments: ShiftAssignment[];
  attendance_summary?: AttendanceSummary;
}

export interface ImportEmailsResult {
  message: string;
  matched: number;
  unmatched: number;
  unmatched_names: string[];
}

export interface SendBatchEmailsResult {
  message: string;
  total_employees: number;
  estimated_hours: number;
}

export interface EmployeeSummary {
  id: number;
  internal_id: string;
  full_name: string;
}

// ── Shifts ──
export interface ShiftBreak {
  id: number;
  type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  position: number;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  crosses_midnight: boolean;
  tolerance_minutes: number;
  overtime_enabled: boolean;
  overtime_min_block_minutes: number | null;
  max_daily_overtime_minutes: number | null;
  is_active: boolean;
  breaks: ShiftBreak[];
}

// ── Shift Assignments ──
export interface ShiftAssignment {
  id: number;
  employee_id: number;
  shift_id: number;
  effective_date: string;
  end_date: string | null;
  work_days: number[];
  employee?: Employee;
  shift?: Shift;
}

// ── Schedule Exceptions ──
export interface ScheduleException {
  id: number;
  employee_id: number;
  date: string;
  shift_id: number | null;
  is_working_day: boolean;
  reason: string | null;
  shift: Shift | null;
  employee?: Employee;
}

// ── Attendance ──
export interface AttendanceEdit {
  id: number;
  field_changed: string;
  old_value: string;
  new_value: string;
  reason: string;
  editor: { id: number; name: string };
  created_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'incomplete' | 'rest' | 'holiday';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee: Employee;
  date_reference: string;
  first_check_in: string | null;
  last_check_out: string | null;
  worked_minutes: number;
  overtime_minutes: number;
  overtime_diurnal_minutes: number;
  overtime_nocturnal_minutes: number;
  late_minutes: number;
  early_departure_minutes: number;
  status: AttendanceStatus;
  is_manually_edited: boolean;
  edits?: AttendanceEdit[];
}

// ── Import ──
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportBatch {
  id: number;
  uploaded_by: number;
  original_filename: string;
  file_hash: string;
  status: ImportStatus;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  errors: string[] | null;
  processed_at: string | null;
}

// ── Reports ──
export type ReportType = 'individual' | 'general' | 'tardanzas' | 'incompletas' | 'informe_total' | 'horas_laborales';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ReportSummaryIndividual {
  employee_name: string;
  employee_code: string;
  total_days: number;
  days_present: number;
  days_absent: number;
  days_incomplete: number;
  times_late: number;
  total_late_minutes: number;
  total_worked_minutes: number;
  total_overtime_minutes: number;
  total_overtime_diurnal_minutes: number;
  total_overtime_nocturnal_minutes: number;
  total_early_departure_minutes: number;
}

export interface ReportSummaryGeneral {
  total_employees: number;
  total_days: number;
  days_present: number;
  days_absent: number;
  days_incomplete: number;
  total_late_entries: number;
  total_late_minutes: number;
  total_worked_minutes: number;
  total_overtime_minutes: number;
  total_overtime_diurnal_minutes: number;
  total_overtime_nocturnal_minutes: number;
  total_early_departure_minutes: number;
}

export interface ReportSummaryTardanzas {
  total_employees_with_tardanzas: number;
  total_tardanzas: number;
  total_late_minutes: number;
}

export interface ReportSummaryIncompletas {
  total_employees_with_incompletas: number;
  total_incompletas: number;
  total_worked_minutes: number;
}

export interface ReportSummaryInformeTotal {
  total_employees_affected: number;
  total_records: number;
  total_tardanzas: number;
  total_salidas_temprano: number;
  total_incompletas: number;
  total_late_minutes: number;
  total_early_departure_minutes: number;
}

export interface ReportSummaryHorasLaborales {
  total_employees: number;
  total_worked_minutes: number;
}

export type ReportSummary =
  | ReportSummaryIndividual
  | ReportSummaryGeneral
  | ReportSummaryTardanzas
  | ReportSummaryIncompletas
  | ReportSummaryInformeTotal
  | ReportSummaryHorasLaborales;

export interface ReportRow {
  employee_id?: number;
  employee_name?: string;
  employee_code?: string;
  department?: string;
  date: string;
  first_check_in: string | null;
  last_check_out: string | null;
  worked_minutes: number;
  late_minutes: number;
  early_departure_minutes: number;
  overtime_minutes: number;
  overtime_diurnal_minutes: number;
  overtime_nocturnal_minutes: number;
  status: string;
}

export interface ReportRowHorasLaborales {
  employee_code: string;
  employee_name: string;
  department: string;
  days_worked: number;
  days_absent: number;
  days_incomplete: number;
  total_worked_minutes: number;
}

export interface Report {
  id: number;
  name: string;
  generated_by: number;
  employee_id: number | null;
  employee?: Employee;
  type: ReportType;
  date_from: string;
  date_to: string;
  status: ReportStatus;
  summary: ReportSummary | null;
  rows: ReportRow[] | ReportRowHorasLaborales[] | null;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Settings ──
export interface SystemSetting {
  key: string;
  value: string;
  group: string;
}


