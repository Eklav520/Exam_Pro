import { useId, useState, type FormEvent } from 'react';
import type { CentreDto, TerminalDto } from '@/features/centres';
import { Button, Field, Modal } from '@/shared/ui';
import type { MonitoredCandidate } from '../data/sample';
import { freeSystems, ordinal } from '../model/mapping';
import type { CandidateChanges } from '../model/mappingSlice';
import { shortName } from '../model/terminalStatus';

const MAX_PREFERENCES = 3;
const NONE = '';

interface MapCandidateDialogProps {
  candidate: MonitoredCandidate;
  candidates: MonitoredCandidate[];
  centres: CentreDto[];
  terminals: TerminalDto[];
  onSave: (changes: CandidateChanges) => void;
  onClose: () => void;
}

/** Mount while open, so every opening starts from the candidate's saved details. */
export function MapCandidateDialog({
  candidate,
  candidates,
  centres,
  terminals,
  onSave,
  onClose,
}: MapCandidateDialogProps) {
  const titleId = useId();
  const [name, setName] = useState(candidate.name);
  const [mobile, setMobile] = useState(candidate.mobile);
  const [email, setEmail] = useState(candidate.email);
  const [preferences, setPreferences] = useState(() =>
    Array.from({ length: MAX_PREFERENCES }, (_, index) => candidate.preferences[index] ?? NONE),
  );
  const [centreId, setCentreId] = useState(candidate.centreId ?? NONE);
  const [systemId, setSystemId] = useState(candidate.systemId ?? NONE);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const chosen = preferences.filter(Boolean);
  const centreName = (id: string) => {
    const centre = centres.find(({ _id }) => _id === id);
    return centre ? `${centre.name} – ${centre.city}` : id;
  };
  // Preferred centres first, so following the candidate's wishes is the easy path.
  const centreOptions = [
    ...chosen.map((id, index) => ({
      value: id,
      label: `${centreName(id)} (${ordinal(index)} choice)`,
    })),
    ...centres
      .filter(({ _id }) => !chosen.includes(_id))
      .map(({ _id }) => ({ value: _id, label: centreName(_id) })),
  ];
  const systems = centreId
    ? freeSystems(terminals, candidates, centreId, candidate.registrationNo)
    : [];

  const errors = {
    name: name.trim() ? undefined : 'Enter the candidate’s name',
    mobile: /^[6-9]\d{9}$/.test(mobile.trim()) ? undefined : 'Enter a 10-digit mobile number',
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : 'Enter a valid email address',
    preferences:
      chosen.length < 2
        ? 'Choose at least two centres'
        : new Set(chosen).size < chosen.length
          ? 'Choose each centre only once'
          : undefined,
    systemId: centreId && !systemId ? 'Choose a computer at this centre' : undefined,
  };
  const shown = (message: string | undefined) => (isSubmitted ? message : undefined);

  const setPreference = (index: number, value: string) =>
    setPreferences(preferences.map((item, at) => (at === index ? value : item)));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    onSave({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      preferences: chosen,
      centreId: centreId || null,
      systemId: centreId ? systemId : null,
    });
  };

  return (
    <Modal
      open
      titleId={titleId}
      onClose={onClose}
      className="max-w-2xl! backdrop:backdrop-blur-sm"
    >
      <h2 id={titleId} className="text-lg font-bold">
        Map {candidate.registrationNo}
      </h2>
      <p className="mb-4 text-sm text-muted">
        Correct the candidate’s details, then give them a centre and a computer.
      </p>
      <form noValidate className="space-y-5" onSubmit={handleSubmit}>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Candidate Details</legend>
          <div className="sm:col-span-2">
            <Field label="Full Name" required error={shown(errors.name)}>
              {(props) => (
                <input {...props} value={name} onChange={(event) => setName(event.target.value)} />
              )}
            </Field>
          </div>
          <Field label="Mobile Number" required error={shown(errors.mobile)}>
            {(props) => (
              <input
                {...props}
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
              />
            )}
          </Field>
          <Field label="Email" required error={shown(errors.email)}>
            {(props) => (
              <input
                {...props}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Field>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Centre Preferences</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {preferences.map((value, index) => (
              <Field key={index} label={`${ordinal(index)} Choice`} required={index < 2}>
                {(props) => (
                  <select
                    {...props}
                    value={value}
                    onChange={(event) => setPreference(index, event.target.value)}
                  >
                    <option value={NONE}>{index < 2 ? 'Select a centre' : 'None'}</option>
                    {centres.map(({ _id }) => (
                      <option key={_id} value={_id}>
                        {centreName(_id)}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            ))}
          </div>
          {shown(errors.preferences) && (
            <p className="mt-2 text-sm text-danger">{errors.preferences}</p>
          )}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-semibold">Seat</legend>
          <Field label="Mapped Centre">
            {(props) => (
              <select
                {...props}
                value={centreId}
                onChange={(event) => {
                  setCentreId(event.target.value);
                  setSystemId(NONE);
                }}
              >
                <option value={NONE}>Not mapped</option>
                {centreOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label="System"
            error={shown(errors.systemId)}
            hint={
              centreId ? `${systems.length} free working computers here.` : 'Choose a centre first.'
            }
          >
            {(props) => (
              <select
                {...props}
                value={systemId}
                disabled={!centreId}
                onChange={(event) => setSystemId(event.target.value)}
              >
                <option value={NONE}>Select a computer</option>
                {systems.map((terminal) => (
                  <option key={terminal._id} value={terminal.systemId}>
                    {shortName(terminal.systemId)} – Seat {terminal.seatNumber}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Mapping</Button>
        </div>
      </form>
    </Modal>
  );
}
