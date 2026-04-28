import { api } from './client';
import { buildQueryString } from '@/utils/formatting';
import type {
    User,
    LoginResponse,
    RegisterResponse,
    Employee,
    EmployeeSummary,
    ImportEmailsResult,
    SendBatchEmailsResult,
    Shift,
    ShiftBreak,
    ShiftAssignment,
    ScheduleException,
    AttendanceRecord,
    ImportBatch,
    Report,
    SystemSetting,
    PaginatedResponse,
} from '@/types/api';

// ── Auth ──
export const auth = {
    login: (data: { email: string; password: string }) =>
        api.post<LoginResponse>('/login', data),
    register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
        api.post<RegisterResponse>('/register', data),
    logout: () => api.post<{ message: string }>('/logout'),
    me: () => api.get<User>('/me'),
};

// ── Employees ──
export const employees = {
    list: (page = 1, search?: string, sortBy?: string, order?: 'asc' | 'desc', perPage?: number) => {
        const qs = buildQueryString({ page, search, sort_by: sortBy, order, per_page: perPage });
        return api.get<PaginatedResponse<Employee>>(`/employees?${qs}`);
    },
    get: (id: number) =>
        api.get<{ data: Employee }>(`/employees/${id}`),
    update: (id: number, data: Partial<Pick<Employee, 'first_name' | 'last_name' | 'department' | 'position'>>) =>
        api.put<{ data: Employee }>(`/employees/${id}`, data),
    toggleActive: (id: number) =>
        api.patch<{ message: string; is_active: boolean }>(`/employees/${id}/toggle-active`),
    allIds: (params?: { search?: string; active_only?: boolean }) => {
        const qs = buildQueryString({ search: params?.search, active_only: params?.active_only ? 1 : undefined });
        return api.get<{ data: EmployeeSummary[]; total: number }>(`/employees/all-ids${qs ? `?${qs}` : ''}`);
    },
    importEmails: (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return api.post<ImportEmailsResult>('/employees/import-emails', fd);
    },
};

// ── Shifts ──
export const shifts = {
    list: (page = 1, perPage?: number) => {
        const qs = buildQueryString({ page, per_page: perPage });
        return api.get<PaginatedResponse<Shift>>(`/shifts?${qs}`);
    },
    get: (id: number) =>
        api.get<{ data: Shift }>(`/shifts/${id}`),
    create: (data: Omit<Partial<Shift>, 'breaks'> & { breaks?: Omit<ShiftBreak, 'id'>[] }) =>
        api.post<{ data: Shift }>('/shifts', data),
    update: (id: number, data: Omit<Partial<Shift>, 'breaks'> & { breaks?: Omit<ShiftBreak, 'id'>[] }) =>
        api.put<{ data: Shift }>(`/shifts/${id}`, data),
    delete: (id: number) =>
        api.delete<{ message: string }>(`/shifts/${id}`),
};

// ── Shift Assignments ──
export const shiftAssignments = {
    listByEmployee: (employeeId: number) =>
        api.get<{ data: ShiftAssignment[] }>(`/employees/${employeeId}/shifts`),
    get: (id: number) =>
        api.get<{ data: ShiftAssignment }>(`/employee-shifts/${id}`),
    create: (data: { employee_id: number; shift_id: number; effective_date: string; end_date?: string; work_days?: number[] }) =>
        api.post<{ data: ShiftAssignment }>('/employee-shifts', data),
    update: (id: number, data: Partial<{ shift_id: number; effective_date: string; end_date: string; work_days: number[] }>) =>
        api.put<{ data: ShiftAssignment }>(`/employee-shifts/${id}`, data),
    delete: (id: number) =>
        api.delete<{ message: string }>(`/employee-shifts/${id}`),
    bulkDelete: (employeeIds?: number[]) =>
        api.delete<{ message: string; deleted_count: number }>('/employee-shifts', employeeIds ? { employee_ids: employeeIds } : undefined),
};

// ── Schedule Exceptions ──
export const scheduleExceptions = {
    listByEmployee: (employeeId: number, params?: { per_page?: number; page?: number }) => {
        const qs = buildQueryString(params ?? {});
        return api.get<PaginatedResponse<ScheduleException>>(`/employees/${employeeId}/schedule-exceptions${qs ? `?${qs}` : ''}`);
    },
    get: (id: number) =>
        api.get<{ data: ScheduleException }>(`/schedule-exceptions/${id}`),
    create: (data: { employee_id: number; date: string; shift_id?: number; is_working_day?: boolean; reason?: string }) =>
        api.post<{ data: ScheduleException }>('/schedule-exceptions', data),
    batch: (exceptions: Array<{ employee_id: number; date: string; shift_id?: number; is_working_day?: boolean; reason?: string }>) =>
        api.post<{ message: string; count: number; data: ScheduleException[] }>('/schedule-exceptions/batch', { exceptions }),
    delete: (id: number) =>
        api.delete<{ message: string }>(`/schedule-exceptions/${id}`),
};

// ── Attendance ──
export const attendance = {
    list: (params?: Record<string, string | number>) => {
        const qs = buildQueryString(params ?? {});
        return api.get<PaginatedResponse<AttendanceRecord>>(`/attendance${qs ? `?${qs}` : ''}`);
    },
    dateRange: () =>
        api.get<{ data: { min_date: string | null; max_date: string | null } }>('/attendance/date-range'),
    get: (id: number) =>
        api.get<{ data: AttendanceRecord }>(`/attendance/${id}`),
    byEmployee: (employeeId: number, params?: Record<string, string | number>) => {
        const qs = buildQueryString(params ?? {});
        return api.get<PaginatedResponse<AttendanceRecord>>(`/attendance/employee/${employeeId}${qs ? `?${qs}` : ''}`);
    },
    byDay: (date: string, params?: Record<string, string | number>) => {
        const qs = buildQueryString(params ?? {});
        return api.get<PaginatedResponse<AttendanceRecord>>(`/attendance/day/${date}${qs ? `?${qs}` : ''}`);
    },
    update: (id: number, data: Record<string, unknown>) =>
        api.put<{ data: AttendanceRecord; edits_created: number }>(`/attendance/${id}`, data),
};

// ── Import ──
export const imports = {
    upload: (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return api.post<{ data: ImportBatch }>('/import', fd);
    },
    list: (page = 1, perPage?: number) => {
        const qs = buildQueryString({ page, per_page: perPage });
        return api.get<PaginatedResponse<ImportBatch>>(`/import?${qs}`);
    },
    get: (id: number) =>
        api.get<{ data: ImportBatch }>(`/import/${id}`),
    reprocess: (id: number) =>
        api.post<{ message: string; deleted_attendance_days: number; groups_to_process: number }>(`/import/${id}/reprocess`),
};

// ── Reports ──
export const reports = {
    list: (params?: Record<string, string | number>) => {
        const qs = buildQueryString(params ?? {});
        return api.get<PaginatedResponse<Report>>(`/reports${qs ? `?${qs}` : ''}`);
    },
    create: (data: { type: string; employee_id?: number; date_from: string; date_to: string }) =>
        api.post<{ data: Report }>('/reports', data),
    get: (id: number, includeRows = true) =>
        api.get<{ data: Report }>(`/reports/${id}${includeRows ? '' : '?include_rows=false'}`),
    delete: (id: number) =>
        api.delete<{ message: string }>(`/reports/${id}`),
    download: (id: number) =>
        api.getBlob(`/reports/${id}/download`),
    sendEmail: (id: number) =>
        api.post<{ message: string }>(`/reports/${id}/send-email`),
    sendBatchEmails: (id: number) =>
        api.post<SendBatchEmailsResult>(`/reports/${id}/send-batch-emails`),
};

// ── Settings ──
export const settings = {
    list: () =>
        api.get<{ data: SystemSetting[] }>('/settings'),
    update: (settingsData: Array<{ key: string; value: string }>) =>
        api.put<{ message: string; updated_keys: string[] }>('/settings', { settings: settingsData }),
};
