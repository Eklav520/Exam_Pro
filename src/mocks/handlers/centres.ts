import { http, HttpResponse } from 'msw';
import { url } from './utils';

// Same shapes as the centres API responses.
type TerminalStatus = 'ONLINE' | 'IDLE' | 'FAULT' | 'IN_EXAM';

interface CentreDto {
  _id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  district: string;
  address: string;
  terminalCount: number;
}

interface TerminalDto {
  _id: string;
  centreId: string;
  centreCode: string;
  systemId: string;
  seatNumber: string;
  ipv4Address: string;
  macAddress: string;
  status: TerminalStatus;
  focusViolations: number;
  lastHeartbeatAt?: string | null;
}

type CentreRow = [
  letter: string,
  state: string,
  district: string,
  city: string,
  computers: number,
  idle: number[],
  /** PC numbers with a fault, or 'all' for a centre that is offline. */
  fault: number[] | 'all',
];

const AP = 'Andhra Pradesh';
const TS = 'Telangana';

// State → district → centre, as the APPSC conducts exams across districts.
const centreRows: CentreRow[] = [
  ['A', AP, 'NTR', 'Vijayawada', 20, [5], []],
  ['B', AP, 'NTR', 'Vijayawada', 24, [3, 17], [11]],
  ['C', AP, 'Visakhapatnam', 'Visakhapatnam', 20, [], [2]],
  ['D', AP, 'Visakhapatnam', 'Gajuwaka', 20, [14], [8]],
  ['E', AP, 'Tirupati', 'Tirupati', 16, [9], []],
  ['F', AP, 'Guntur', 'Guntur', 20, [1, 2], [19, 20]],
  ['G', AP, 'Kurnool', 'Kurnool', 12, [], []],
  ['H', TS, 'Hyderabad', 'Hyderabad', 10, [], 'all'],
];

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

const mockCentres: CentreDto[] = centreRows.map(([letter, state, district, city, computers]) => ({
  _id: `cen-${letter.toLowerCase()}`,
  code: `CEN-${letter}`,
  name: `Centre ${letter}`,
  city,
  state,
  district,
  address: `Lab Block 1, ExamPro Centre ${letter}, ${city}`,
  terminalCount: computers,
}));

// During an exam most machines are in use; a few are idle or faulty.
const mockTerminals: TerminalDto[] = centreRows.flatMap(
  ([letter, , , , computers, idle, fault], centre) =>
    Array.from({ length: computers }, (_, index): TerminalDto => {
      const pc = index + 1;
      const status: TerminalStatus =
        fault === 'all' || fault.includes(pc)
          ? 'FAULT'
          : idle.includes(pc)
            ? 'IDLE'
            : pc % 3 === 0
              ? 'ONLINE'
              : 'IN_EXAM';
      return {
        _id: `term-${letter.toLowerCase()}-${pad(pc)}`,
        centreId: `cen-${letter.toLowerCase()}`,
        centreCode: `CEN-${letter}`,
        systemId: `CEN-${letter}-PC-${pad(pc)}`,
        seatNumber: `${letter}-${pad(pc, 3)}`,
        ipv4Address: `192.168.${10 + centre}.${10 + pc}`,
        macAddress: `00:1B:44:1${centre}:3A:${pad(pc)}`,
        status,
        focusViolations: 0,
        lastHeartbeatAt: status === 'FAULT' ? null : new Date().toISOString(),
      };
    }),
);

const newTerminal = (body: Record<string, string | undefined>): TerminalDto => {
  const centre = mockCentres.find((item) => item.code === body.centreCode) ?? mockCentres[0]!;
  return {
    _id: `term-${Date.now()}-${Math.random()}`,
    centreId: centre._id,
    centreCode: centre.code,
    systemId: body.systemId ?? '',
    seatNumber: body.seatNumber ?? '',
    ipv4Address: body.ipv4Address ?? '',
    macAddress: body.macAddress ?? '',
    status: 'IDLE',
    focusViolations: 0,
  };
};

const allocation = {
  _id: 'alloc-1',
  rollNo: 'ROLL1004',
  candidateName: 'Neha Verma',
  photoUrl: '/images/candidate-neha.jpg',
  seatNumber: 'A-004',
  systemId: 'CEN-A-PC-04',
  status: 'ALLOCATED',
  examId: { title: 'APPSC Computer Proficiency Test', durationMinutes: 150 },
  centreId: {
    code: 'CEN-A',
    name: 'Centre A',
    address: 'Lab Block 1, ExamPro Centre A, Vijayawada',
  },
};

export const centreHandlers = [
  http.get(url('/centres'), () => HttpResponse.json({ centres: mockCentres })),
  http.get(url('/terminals'), ({ request }) => {
    const centreId = new URL(request.url).searchParams.get('centreId');
    const terminals = centreId
      ? mockTerminals.filter((terminal) => terminal.centreId === centreId)
      : mockTerminals;
    return HttpResponse.json({ terminals });
  }),
  http.post(url('/terminals/register'), async ({ request }) => {
    const terminal = newTerminal((await request.json()) as Record<string, string>);
    mockTerminals.push(terminal);
    return HttpResponse.json({ terminal }, { status: 201 });
  }),
  http.post(url('/terminals/bulk-import'), async ({ request }) => {
    const { rows } = (await request.json()) as { rows: Record<string, string>[] };
    mockTerminals.push(...rows.map(newTerminal));
    return HttpResponse.json({ inserted: rows.length, updated: 0, failed: [] });
  }),
  http.post(url('/allocations/auto-assign'), () =>
    HttpResponse.json(
      {
        allocatedCount: 1,
        allocations: [
          {
            _id: 'alloc-1',
            rollNo: 'ROLL1004',
            candidateName: 'Neha Verma',
            systemId: 'CEN-A-PC-04',
            seatNumber: 'A-004',
          },
        ],
      },
      { status: 201 },
    ),
  ),
  http.get(url('/student/my-allocation'), () => HttpResponse.json({ allocation })),
];
