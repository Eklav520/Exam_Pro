import {
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Monitor,
  Plus,
  Search,
  Server,
  Upload,
  Wand2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Badge, Button, Card, PageHeader, StatCard } from '@/shared/ui';
import {
  useAutoAssignSeatsMutation,
  useBulkImportTerminalsMutation,
  useGetCentresQuery,
  useGetTerminalsQuery,
  useRegisterTerminalMutation,
} from '../api/centresApi';

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

interface ParsedExcelRow {
  centreCode: string;
  centreName: string;
  city: string;
  seatNumber: string;
  systemId: string;
  ipv4Address: string;
  macAddress: string;
  valid: boolean;
  error?: string;
}

function formatMacInput(raw: string): string {
  const hex = raw.replace(/[^0-9A-Fa-f]/g, '').slice(0, 12).toUpperCase();
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
}

function downloadExcelTemplate() {
  const rows = [
    {
      'Centre Code': 'CEN-A',
      'Centre Name': 'Centre A',
      City: 'Hyderabad',
      'Seat Number': 'A-004',
      'System ID': 'CEN-A-PC-04',
      'IPv4 Address': '192.168.10.14',
      'MAC Address': '00:1B:44:11:3A:B7',
    },
    {
      'Centre Code': 'CEN-A',
      'Centre Name': 'Centre A',
      City: 'Hyderabad',
      'Seat Number': 'A-005',
      'System ID': 'CEN-A-PC-05',
      'IPv4 Address': '192.168.10.15',
      'MAC Address': '00:1B:44:11:3A:B8',
    },
  ];
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Terminals');
  XLSX.writeFile(workbook, 'ExamPro_Centres_Terminals_Template.xlsx');
}

export function CentresPage() {
  useDocumentTitle('Exam Centres');
  const { data: centresData, refetch: refetchCentres } = useGetCentresQuery();
  const { data: terminalsData, refetch: refetchTerminals } = useGetTerminalsQuery();
  const [registerTerminal, { isLoading: isRegistering }] = useRegisterTerminalMutation();
  const [bulkImport, { isLoading: isImporting }] = useBulkImportTerminalsMutation();
  const [autoAssign, { isLoading: isAssigning }] = useAutoAssignSeatsMutation();

  const [activeTab, setActiveTab] = useState<'excel' | 'manual'>('excel');
  const [search, setSearch] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual form state
  const [centreCode, setCentreCode] = useState('CEN-A');
  const [centreName, setCentreName] = useState('Centre A');
  const [seatNumber, setSeatNumber] = useState('');
  const [systemId, setSystemId] = useState('');
  const [ipv4Address, setIpv4Address] = useState('');
  const [macAddress, setMacAddress] = useState('');

  // Auto-allocate state
  const [examId, setExamId] = useState('default-exam');
  const [allocatedPreview, setAllocatedPreview] = useState<
    { rollNo: string; candidateName: string; systemId: string; seatNumber: string }[]
  >([]);

  const centres = centresData?.centres ?? [];
  const terminals = terminalsData?.terminals ?? [];

  const filteredTerminals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return terminals;
    return terminals.filter(
      (t) =>
        t.centreCode.toLowerCase().includes(q) ||
        t.systemId.toLowerCase().includes(q) ||
        t.seatNumber.toLowerCase().includes(q) ||
        t.ipv4Address.toLowerCase().includes(q) ||
        t.macAddress.toLowerCase().includes(q),
    );
  }, [terminals, search]);

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return;
    const firstSheet = workbook.Sheets[firstSheetName];
    if (!firstSheet) return;
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

    const validated: ParsedExcelRow[] = rawRows.map((row) => {
      const cCode = String(row['Centre Code'] ?? row.centreCode ?? '').trim().toUpperCase();
      const cName = String(row['Centre Name'] ?? row.centreName ?? cCode).trim();
      const city = String(row['City'] ?? row.city ?? '').trim();
      const seat = String(row['Seat Number'] ?? row.seatNumber ?? '').trim().toUpperCase();
      const sysId = String(row['System ID'] ?? row.systemId ?? '').trim().toUpperCase();
      const ip = String(row['IPv4 Address'] ?? row.ipv4Address ?? '').trim();
      const mac = String(row['MAC Address'] ?? row.macAddress ?? '')
        .trim()
        .replace(/-/g, ':')
        .toUpperCase();

      const errors: string[] = [];
      if (!cCode) errors.push('Missing Centre Code');
      if (!seat) errors.push('Missing Seat');
      if (!sysId) errors.push('Missing System ID');
      if (!IPV4_REGEX.test(ip)) errors.push('Invalid IPv4');
      if (!MAC_REGEX.test(mac)) errors.push('Invalid MAC');

      return {
        centreCode: cCode,
        centreName: cName,
        city,
        seatNumber: seat,
        systemId: sysId,
        ipv4Address: ip,
        macAddress: mac,
        valid: errors.length === 0,
        error: errors.join(', '),
      };
    });

    setParsedRows(validated);
    setStatusMessage(null);
  };

  const handleBulkSave = async () => {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    const res = await bulkImport({ rows: validRows as unknown as Record<string, unknown>[] }).unwrap();
    setStatusMessage(`Imported ${res.inserted} new, updated ${res.updated} terminals.`);
    setParsedRows([]);
    void refetchCentres();
    void refetchTerminals();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!IPV4_REGEX.test(ipv4Address) || !MAC_REGEX.test(macAddress)) {
      setStatusMessage('Please enter a valid IPv4 and MAC address.');
      return;
    }
    await registerTerminal({
      centreCode,
      centreName,
      seatNumber,
      systemId,
      ipv4Address,
      macAddress,
    }).unwrap();
    setSeatNumber('');
    setSystemId('');
    setIpv4Address('');
    setMacAddress('');
    setStatusMessage('Terminal registered successfully.');
    void refetchCentres();
    void refetchTerminals();
  };

  const handleAutoAllocate = async () => {
    const res = await autoAssign({ examId }).unwrap();
    setAllocatedPreview(res.allocations);
    setStatusMessage(`Auto-allocated ${res.allocatedCount} seat(s).`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Centres & Terminal IPs"
        description="Register lab PCs via bulk Excel upload or manual entry and auto-allocate candidate seats."
      />

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Centres" value={centres.length} icon={Building2} tone="blue" />
        <StatCard label="Registered Terminals" value={terminals.length} icon={Server} tone="teal" />
        <StatCard
          label="Online Terminals"
          value={terminals.filter((t) => t.status === 'ONLINE' || t.status === 'IN_EXAM').length}
          icon={Monitor}
          tone="green"
        />
        <StatCard
          label="Idle / Unassigned PCs"
          value={terminals.filter((t) => t.status === 'IDLE').length}
          icon={CheckCircle2}
          tone="amber"
        />
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          {statusMessage}
        </div>
      )}

      {/* Two Primary Tabs: Bulk Excel vs Manual Entry */}
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'excel' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('excel')}
            >
              <FileSpreadsheet className="size-4" />
              Option A: Bulk Excel Upload
            </Button>
            <Button
              variant={activeTab === 'manual' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('manual')}
            >
              <Plus className="size-4" />
              Option B: Manual PC Entry
            </Button>
          </div>
          <Button variant="secondary" onClick={downloadExcelTemplate}>
            <Download className="size-4" />
            Download Excel Template
          </Button>
        </div>

        {activeTab === 'excel' ? (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-teal-500 hover:bg-teal-50/30">
              <Upload className="mb-2 size-7 text-teal-700" />
              <span className="text-sm font-semibold text-ink">
                Click to upload `.xlsx` or `.csv` terminal sheet
              </span>
              <span className="mt-1 text-xs text-muted">
                Columns: Centre Code, Centre Name, City, Seat Number, System ID, IPv4 Address, MAC Address
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => void handleFileUpload(e.target.files?.[0])}
              />
            </label>

            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    Live Validation Preview ({parsedRows.filter((r) => r.valid).length} valid /{' '}
                    {parsedRows.length} total)
                  </p>
                  <Button
                    isLoading={isImporting}
                    disabled={parsedRows.every((r) => !r.valid)}
                    onClick={() => void handleBulkSave()}
                  >
                    Import Valid Rows
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-muted">
                      <tr>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Centre</th>
                        <th className="px-3 py-2">Seat</th>
                        <th className="px-3 py-2">System ID</th>
                        <th className="px-3 py-2">IPv4</th>
                        <th className="px-3 py-2">MAC Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={row.valid ? 'bg-white' : 'bg-rose-50/70'}>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                                <CheckCircle2 className="size-3.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                                <XCircle className="size-3.5" /> {row.error}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium">{row.centreCode}</td>
                          <td className="px-3 py-2">{row.seatNumber}</td>
                          <td className="px-3 py-2">{row.systemId}</td>
                          <td className="px-3 py-2 font-mono">{row.ipv4Address}</td>
                          <td className="px-3 py-2 font-mono">{row.macAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={(e) => void handleManualSubmit(e)} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Centre Code</label>
              <input
                className="control"
                value={centreCode}
                onChange={(e) => setCentreCode(e.target.value.toUpperCase())}
                placeholder="CEN-A"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Centre Name</label>
              <input
                className="control"
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                placeholder="Centre A"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Seat Number</label>
              <input
                className="control"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
                placeholder="A-005"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">System ID</label>
              <input
                className="control"
                value={systemId}
                onChange={(e) => setSystemId(e.target.value.toUpperCase())}
                placeholder="CEN-A-PC-05"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">IPv4 Address</label>
              <input
                className="control font-mono"
                value={ipv4Address}
                onChange={(e) => setIpv4Address(e.target.value)}
                placeholder="192.168.10.15"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">MAC Address</label>
              <input
                className="control font-mono"
                value={macAddress}
                onChange={(e) => setMacAddress(formatMacInput(e.target.value))}
                placeholder="00:1B:44:11:3A:B8"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" isLoading={isRegistering}>
                Register Terminal
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Auto-Allocate Bar & Registered Terminals Table */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              className="control pl-9"
              placeholder="Search by Centre, Seat, System ID, IPv4, or MAC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              className="control w-40"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              placeholder="Exam ID"
            />
            <Button isLoading={isAssigning} onClick={() => void handleAutoAllocate()}>
              <Wand2 className="size-4" />
              Auto-Allocate Seats
            </Button>
          </div>
        </div>

        {allocatedPreview.length > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
            <p className="mb-1 font-semibold text-emerald-900">Latest Seat Allocations:</p>
            <div className="flex flex-wrap gap-2">
              {allocatedPreview.map((a) => (
                <Badge key={a.rollNo} tone="success">
                  {a.rollNo} ({a.candidateName}) → {a.seatNumber} [{a.systemId}]
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5">Centre</th>
                <th className="px-4 py-2.5">Seat</th>
                <th className="px-4 py-2.5">System ID</th>
                <th className="px-4 py-2.5">IPv4 Address</th>
                <th className="px-4 py-2.5">MAC Address</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTerminals.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium">{t.centreCode}</td>
                  <td className="px-4 py-2.5">{t.seatNumber}</td>
                  <td className="px-4 py-2.5 font-semibold">{t.systemId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{t.ipv4Address}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{t.macAddress}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      tone={
                        t.status === 'ONLINE' || t.status === 'IN_EXAM'
                          ? 'success'
                          : t.status === 'FAULT'
                            ? 'danger'
                            : 'neutral'
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
