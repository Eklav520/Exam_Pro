import {
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Monitor,
  Plus,
  Server,
  Upload,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { SystemsView } from '@/features/monitoring';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button, Card, PageHeader, StatCard } from '@/shared/ui';
import {
  useBulkImportCentresMutation,
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

interface ParsedCentreRow {
  code: string;
  name: string;
  state: string;
  district: string;
  mandal: string;
  pincode: string;
  address: string;
  totalSystems: number;
  bufferSystems: number;
  valid: boolean;
  error?: string;
}

function downloadCentresTemplate() {
  const rows = [
    {
      'Centre Code': 'CEN-A',
      'Centre Name': 'JNTUACEP Lab Block 1',
      State: 'Andhra Pradesh',
      District: 'YSR Kadapa',
      Mandal: 'Pulivendula',
      Pincode: '516390',
      Address: 'Main Campus, Lab Block 1',
      'Total Systems': 150,
      'Buffer Systems': 10,
    },
  ];
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Centres');
  XLSX.writeFile(workbook, 'ExamPro_Centres_Template.xlsx');
}

function formatMacInput(raw: string): string {
  const hex = raw
    .replace(/[^0-9A-Fa-f]/g, '')
    .slice(0, 12)
    .toUpperCase();
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
  const [bulkImportCentres, { isLoading: isImportingCentres }] = useBulkImportCentresMutation();
  const [bulkImport, { isLoading: isImporting }] = useBulkImportTerminalsMutation();

  const [activeTab, setActiveTab] = useState<'centres' | 'excel' | 'manual'>('centres');
  const [parsedCentres, setParsedCentres] = useState<ParsedCentreRow[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual form state
  const [centreCode, setCentreCode] = useState('CEN-A');
  const [centreName, setCentreName] = useState('Centre A');
  const [seatNumber, setSeatNumber] = useState('');
  const [systemId, setSystemId] = useState('');
  const [ipv4Address, setIpv4Address] = useState('');
  const [macAddress, setMacAddress] = useState('');

  const centres = centresData?.centres ?? [];
  const terminals = terminalsData?.terminals ?? [];

  const handleCentreFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return;
    const firstSheet = workbook.Sheets[firstSheetName];
    if (!firstSheet) return;
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

    const validated: ParsedCentreRow[] = rawRows.map((row) => {
      const code = String(row['Centre Code'] ?? row.code ?? '').trim().toUpperCase();
      const name = String(row['Centre Name'] ?? row.name ?? '').trim();
      const state = String(row.State ?? row.state ?? '').trim();
      const district = String(row.District ?? row.district ?? '').trim();
      const mandal = String(row.Mandal ?? row.mandal ?? '').trim();
      const pincode = String(row.Pincode ?? row.pincode ?? '').trim();
      const address = String(row.Address ?? row.address ?? '').trim();
      const totalSystems = Number(row['Total Systems'] ?? row.totalSystems ?? 0);
      const bufferSystems = Number(row['Buffer Systems'] ?? row.bufferSystems ?? 0);

      const errors: string[] = [];
      if (!code) errors.push('Missing Centre Code');
      if (!name) errors.push('Missing Centre Name');
      if (!state) errors.push('Missing State');
      if (!district) errors.push('Missing District');
      if (!pincode || !/^\d{6}$/.test(pincode)) errors.push('Invalid Pincode');

      return {
        code,
        name,
        state,
        district,
        mandal,
        pincode,
        address,
        totalSystems,
        bufferSystems,
        valid: errors.length === 0,
        error: errors.join(', '),
      };
    });

    setParsedCentres(validated);
    setStatusMessage(null);
  };

  const handleBulkSaveCentres = async () => {
    const validRows = parsedCentres.filter((r) => r.valid);
    if (validRows.length === 0) return;
    const res = await bulkImportCentres({
      rows: validRows as unknown as Record<string, unknown>[],
    }).unwrap();
    setStatusMessage(`Imported ${res.inserted} new, updated ${res.updated} centres.`);
    setParsedCentres([]);
    void refetchCentres();
  };

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
      const cCode = String(row['Centre Code'] ?? row.centreCode ?? '')
        .trim()
        .toUpperCase();
      const cName = String(row['Centre Name'] ?? row.centreName ?? cCode).trim();
      const city = String(row['City'] ?? row.city ?? '').trim();
      const seat = String(row['Seat Number'] ?? row.seatNumber ?? '')
        .trim()
        .toUpperCase();
      const sysId = String(row['System ID'] ?? row.systemId ?? '')
        .trim()
        .toUpperCase();
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
    const res = await bulkImport({
      rows: validRows as unknown as Record<string, unknown>[],
    }).unwrap();
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

      {/* Three Primary Tabs: Centres Excel, Terminals Excel, Manual Entry */}
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'centres' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('centres')}
            >
              <Building2 className="size-4" />
              1. Upload Centres Excel
            </Button>
            <Button
              variant={activeTab === 'excel' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('excel')}
            >
              <FileSpreadsheet className="size-4" />
              2. Upload Terminals Excel
            </Button>
            <Button
              variant={activeTab === 'manual' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('manual')}
            >
              <Plus className="size-4" />
              3. Manual PC Entry
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={downloadCentresTemplate}>
              <Download className="size-4" />
              Centres Template
            </Button>
            <Button variant="secondary" onClick={downloadExcelTemplate}>
              <Download className="size-4" />
              Terminals Template
            </Button>
          </div>
        </div>

        {activeTab === 'centres' ? (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-teal-500 hover:bg-teal-50/30">
              <Upload className="mb-2 size-7 text-teal-700" />
              <span className="text-sm font-semibold text-ink">
                Click to upload `.xlsx` or `.csv` Centres Master sheet
              </span>
              <span className="mt-1 text-xs text-muted">
                Columns: Centre Code, Centre Name, State, District, Mandal, Pincode, Address, Total Systems, Buffer Systems
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => void handleCentreFileUpload(e.target.files?.[0])}
              />
            </label>

            {parsedCentres.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    Live Validation Preview ({parsedCentres.filter((r) => r.valid).length} valid /{' '}
                    {parsedCentres.length} total)
                  </p>
                  <Button
                    isLoading={isImportingCentres}
                    disabled={parsedCentres.every((r) => !r.valid)}
                    onClick={() => void handleBulkSaveCentres()}
                  >
                    Import Valid Centres
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-muted">
                      <tr>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">Centre Name</th>
                        <th className="px-3 py-2">State / District</th>
                        <th className="px-3 py-2">Mandal / Pincode</th>
                        <th className="px-3 py-2">Systems</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedCentres.map((row, idx) => (
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
                          <td className="px-3 py-2 font-medium">{row.code}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">
                            {row.state} / {row.district}
                          </td>
                          <td className="px-3 py-2">
                            {row.mandal} ({row.pincode})
                          </td>
                          <td className="px-3 py-2">{row.totalSystems}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'excel' ? (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-teal-500 hover:bg-teal-50/30">
              <Upload className="mb-2 size-7 text-teal-700" />
              <span className="text-sm font-semibold text-ink">
                Click to upload `.xlsx` or `.csv` terminal sheet
              </span>
              <span className="mt-1 text-xs text-muted">
                Columns: Centre Code, Centre Name, City, Seat Number, System ID, IPv4 Address, MAC
                Address
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

      <SystemsView />
    </div>
  );
}
