import { http, HttpResponse } from 'msw';

const mockCentres = [
  { _id: 'cen-a', code: 'CEN-A', name: 'Centre A', city: 'Hyderabad', terminalCount: 2 },
  http.get('/api/v1/student/my-allocation', () =>
    HttpResponse.json({
      allocation: {
        _id: 'alloc-1',
        rollNo: 'ROLL1004',
        candidateName: 'Neha Verma',
        photoUrl: '/images/candidate-neha.jpg',
        seatNumber: 'A-004',
        systemId: 'CEN-A-PC-04',
        status: 'ALLOCATED',
        examId: { title: 'MS Office Practical Exam', durationMinutes: 150 },
        centreId: {
          code: 'CEN-A',
          name: 'Centre A',
          address: 'Lab Block 1, ExamPro Centre A, Hyderabad',
        },
      },
    }),
  ),
];

const mockTerminals = [
  {
    _id: 'term-1',
    centreId: 'cen-a',
    centreCode: 'CEN-A',
    systemId: 'CEN-A-PC-04',
    seatNumber: 'A-004',
    ipv4Address: '192.168.10.14',
    macAddress: '00:1B:44:11:3A:B7',
    status: 'ONLINE',
    focusViolations: 0,
  },
  {
    _id: 'term-2',
    centreId: 'cen-a',
    centreCode: 'CEN-A',
    systemId: 'CEN-A-PC-05',
    seatNumber: 'A-005',
    ipv4Address: '192.168.10.15',
    macAddress: '00:1B:44:11:3A:B8',
    status: 'IDLE',
    focusViolations: 0,
  },
  http.get('/api/v1/student/my-allocation', () =>
    HttpResponse.json({
      allocation: {
        _id: 'alloc-1',
        rollNo: 'ROLL1004',
        candidateName: 'Neha Verma',
        photoUrl: '/images/candidate-neha.jpg',
        seatNumber: 'A-004',
        systemId: 'CEN-A-PC-04',
        status: 'ALLOCATED',
        examId: { title: 'MS Office Practical Exam', durationMinutes: 150 },
        centreId: {
          code: 'CEN-A',
          name: 'Centre A',
          address: 'Lab Block 1, ExamPro Centre A, Hyderabad',
        },
      },
    }),
  ),
];

export const centreHandlers = [
  http.get('/api/v1/centres', () => HttpResponse.json({ centres: mockCentres })),
  http.get('/api/v1/terminals', () => HttpResponse.json({ terminals: mockTerminals })),
  http.post('/api/v1/terminals/register', async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    const terminal = {
      _id: `term-${Date.now()}`,
      centreId: 'cen-a',
      centreCode: body.centreCode ?? 'CEN-A',
      systemId: body.systemId ?? '',
      seatNumber: body.seatNumber ?? '',
      ipv4Address: body.ipv4Address ?? '',
      macAddress: body.macAddress ?? '',
      status: 'IDLE',
      focusViolations: 0,
    };
    mockTerminals.push(terminal);
    return HttpResponse.json({ terminal }, { status: 201 });
  }),
  http.post('/api/v1/terminals/bulk-import', async ({ request }) => {
    const { rows } = (await request.json()) as { rows: Record<string, string>[] };
    for (const r of rows) {
      mockTerminals.push({
        _id: `term-${Date.now()}-${Math.random()}`,
        centreId: 'cen-a',
        centreCode: r.centreCode ?? 'CEN-A',
        systemId: r.systemId ?? '',
        seatNumber: r.seatNumber ?? '',
        ipv4Address: r.ipv4Address ?? '',
        macAddress: r.macAddress ?? '',
        status: 'IDLE',
        focusViolations: 0,
      });
    }
    return HttpResponse.json({ inserted: rows.length, updated: 0, failed: [] });
  }),
  http.post('/api/v1/allocations/auto-assign', () =>
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
  http.get('/api/v1/student/my-allocation', () =>
    HttpResponse.json({
      allocation: {
        _id: 'alloc-1',
        rollNo: 'ROLL1004',
        candidateName: 'Neha Verma',
        photoUrl: '/images/candidate-neha.jpg',
        seatNumber: 'A-004',
        systemId: 'CEN-A-PC-04',
        status: 'ALLOCATED',
        examId: { title: 'MS Office Practical Exam', durationMinutes: 150 },
        centreId: {
          code: 'CEN-A',
          name: 'Centre A',
          address: 'Lab Block 1, ExamPro Centre A, Hyderabad',
        },
      },
    }),
  ),
];
