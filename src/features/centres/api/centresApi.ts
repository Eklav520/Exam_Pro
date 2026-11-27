import { baseApi } from '@/shared/api/baseApi';

export interface CentreDto {
  _id: string;
  code: string;
  name: string;
  city: string;
  /** Where the centre sits in the hierarchy: state, then district. */
  state?: string;
  district?: string;
  address?: string;
  terminalCount?: number;
}

export interface TerminalDto {
  _id: string;
  centreId: string;
  centreCode: string;
  systemId: string;
  seatNumber: string;
  ipv4Address: string;
  macAddress: string;
  status: 'ONLINE' | 'IDLE' | 'FAULT' | 'IN_EXAM';
  focusViolations: number;
  lastHeartbeatAt?: string | null;
}

export interface RegisterTerminalPayload {
  centreCode: string;
  centreName?: string;
  seatNumber: string;
  systemId: string;
  ipv4Address: string;
  macAddress: string;
}

export interface BulkImportResponse {
  inserted: number;
  updated: number;
  failed: { row: number; reason: string }[];
}

export interface AutoAssignResponse {
  allocatedCount: number;
  allocations: {
    _id: string;
    rollNo: string;
    candidateName: string;
    systemId: string;
    seatNumber: string;
  }[];
}

export interface StudentAllocationDto {
  _id: string;
  rollNo: string;
  candidateName: string;
  photoUrl: string;
  seatNumber: string;
  systemId: string;
  status: string;
  examId?: { title: string; durationMinutes: number };
  centreId?: { code: string; name: string; address: string };
}

export const centresApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyAllocation: build.query<{ allocation: StudentAllocationDto | null }, void>({
      query: () => '/student/my-allocation',
    }),
    getCentres: build.query<{ centres: CentreDto[] }, void>({
      query: () => '/centres',
    }),
    getTerminals: build.query<{ terminals: TerminalDto[] }, { centreId?: string } | void>({
      query: (params) => ({
        url: '/terminals',
        params: params?.centreId ? { centreId: params.centreId } : undefined,
      }),
    }),
    registerTerminal: build.mutation<{ terminal: TerminalDto }, RegisterTerminalPayload>({
      query: (body) => ({ url: '/terminals/register', method: 'POST', body }),
    }),
    bulkImportTerminals: build.mutation<BulkImportResponse, { rows: Record<string, unknown>[] }>({
      query: (body) => ({ url: '/terminals/bulk-import', method: 'POST', body }),
    }),
    autoAssignSeats: build.mutation<AutoAssignResponse, { examId: string; centreId?: string }>({
      query: (body) => ({ url: '/allocations/auto-assign', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetMyAllocationQuery,
  useGetCentresQuery,
  useGetTerminalsQuery,
  useRegisterTerminalMutation,
  useBulkImportTerminalsMutation,
  useAutoAssignSeatsMutation,
} = centresApi;
