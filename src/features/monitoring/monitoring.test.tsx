import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

async function openSystems() {
  const app = renderApp({ route: path.adminMonitoring, as: 'u-admin' });
  await app.user.click(await screen.findByRole('tab', { name: 'Centre Systems' }));
  await screen.findByRole('table', { name: 'Centres' });
  return app;
}

const centreRows = () =>
  within(screen.getByRole('table', { name: 'Centres' }))
    .getAllByRole('row')
    .slice(1);

async function openCandidates() {
  const app = renderApp({ route: path.adminMonitoring, as: 'u-admin' });
  await screen.findByRole('table', { name: 'Candidates' });
  return app;
}

const candidateRows = () =>
  within(screen.getByRole('table', { name: 'Candidates' }))
    .getAllByRole('row')
    .slice(1);

describe('student system mapping', () => {
  it('shows each candidate’s preferences and where they sit', async () => {
    await openCandidates();
    expect(candidateRows()).toHaveLength(20);
    const row = screen.getByRole('row', { name: /Lakshmi Prasanna/ });
    for (const text of [
      '1st: Centre B',
      '2nd: Centre A',
      'NTR',
      'PC-11',
      'B-011',
      'Fault',
      'Attended',
    ]) {
      expect(row).toHaveTextContent(text);
    }
    expect(screen.getByRole('row', { name: /Bhavana Reddy/ })).toHaveTextContent('Not Mapped');
  });

  it('narrows by state, district and centre on Search', async () => {
    const { user } = await openCandidates();
    await user.selectOptions(screen.getByLabelText('State'), 'Andhra Pradesh');
    // Districts of other states are not offered.
    expect(
      within(screen.getByLabelText('District')).queryByRole('option', { name: 'Hyderabad' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('District'), 'Visakhapatnam');
    expect(within(screen.getByLabelText('Centre')).getAllByRole('option')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Search' }));
    // Four seated there, and one who has not been mapped but chose it first.
    expect(candidateRows()).toHaveLength(5);

    await user.selectOptions(screen.getByLabelText('Mapping'), 'Not Mapped');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(candidateRows().map((row) => row.textContent)).toEqual([
      expect.stringContaining('Suresh Babu'),
    ]);
  });

  it('auto-maps candidates to their first preferred centre with a free working computer', async () => {
    const { user } = await openCandidates();
    await user.click(screen.getByRole('button', { name: 'Auto-map by Preference (6)' }));
    expect(screen.getByRole('button', { name: 'Auto-map by Preference (0)' })).toBeDisabled();
    // 1st choice Centre D, whose PC-08 is faulty and PC-12 taken.
    expect(screen.getByRole('row', { name: /Suresh Babu/ })).toHaveTextContent('PC-01');
    // 1st choice Hyderabad is offline, so the 2nd choice is used.
    const naveen = screen.getByRole('row', { name: /Naveen Kumar/ });
    expect(naveen).toHaveTextContent('Centre A');
    expect(naveen).toHaveTextContent('PC-02');
  });

  it('lets the Admin correct details and map a candidate by hand', async () => {
    const { user } = await openCandidates();
    await user.click(screen.getByRole('button', { name: 'Map Bhavana Reddy' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Map EXM20260015' }));
    const mobile = dialog.getByLabelText('Mobile Number *');
    await user.clear(mobile);
    await user.type(mobile, '12345');
    await user.selectOptions(
      dialog.getByLabelText('Mapped Centre'),
      'Centre B – Vijayawada (2nd choice)',
    );
    // A faulty PC is never offered.
    expect(dialog.queryByRole('option', { name: /PC-11/ })).not.toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Save Mapping' }));
    expect(dialog.getByText('Enter a 10-digit mobile number')).toBeInTheDocument();
    expect(dialog.getByText('Choose a computer at this centre')).toBeInTheDocument();

    await user.clear(mobile);
    await user.type(mobile, '9848011111');
    await user.selectOptions(dialog.getByLabelText('System'), 'PC-02 – Seat B-002');
    await user.click(dialog.getByRole('button', { name: 'Save Mapping' }));

    const row = screen.getByRole('row', { name: /Bhavana Reddy/ });
    expect(row).toHaveTextContent('9848011111');
    expect(row).toHaveTextContent('Centre B');
    expect(row).toHaveTextContent('PC-02');
  });

  it('opens a candidate’s seat and warns when their computer has a fault', async () => {
    const { user } = await openCandidates();
    await user.click(screen.getByRole('button', { name: 'View Sravani Devi' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Sravani Devi' }));
    expect(dialog.getByText('CEN-D-PC-08')).toBeInTheDocument();
    expect(dialog.getByText('D-008')).toBeInTheDocument();
    expect(dialog.getByText('Centre D (CEN-D), Gajuwaka')).toBeInTheDocument();
    expect(dialog.getByRole('alert')).toHaveTextContent('computer has a fault');
    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('centre systems monitoring', () => {
  it('lists every centre with its state, district and computer counts', async () => {
    await openSystems();
    expect(centreRows()).toHaveLength(8);
    expect(screen.getByText('All states · 8 centres in 6 districts')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();

    const centreF = screen.getByRole('row', { name: /Centre F/ });
    expect(centreF).toHaveTextContent('Guntur');
    expect(centreF).toHaveTextContent('Andhra Pradesh');
    expect(centreF).toHaveTextContent('Needs Attention');
    expect(screen.getByRole('row', { name: /Centre H/ })).toHaveTextContent('Offline');
  });

  it('narrows down by state, then district', async () => {
    const { user } = await openSystems();
    await user.selectOptions(screen.getByLabelText('State'), 'Andhra Pradesh');
    expect(centreRows()).toHaveLength(7);
    // Only districts of the chosen state are offered.
    expect(
      within(screen.getByLabelText('District')).queryByRole('option', { name: 'Hyderabad' }),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('District'), 'Visakhapatnam');
    expect(centreRows()).toHaveLength(2);
    expect(
      screen.getByText('Andhra Pradesh › Visakhapatnam · 2 centres in 1 district'),
    ).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Centre Status'), 'Needs Attention');
    expect(centreRows()).toHaveLength(2);
    await user.type(screen.getByLabelText('Search centres'), 'gajuwaka');
    expect(centreRows()).toHaveLength(1);
  });

  it('opens a centre’s computers from the eye icon', async () => {
    const { user } = await openSystems();
    await user.click(screen.getByRole('button', { name: 'View systems of Centre D' }));
    const dialog = within(
      screen.getByRole('dialog', { name: 'Centre D – Live System Monitoring' }),
    );
    expect(
      dialog.getByText(
        /Gajuwaka, Visakhapatnam District, Andhra Pradesh · 20 registered computers/,
      ),
    ).toBeInTheDocument();
    expect(dialog.getByText('PC-08').closest('li')).toHaveTextContent('Fault');
    expect(dialog.getByText('PC-14').closest('li')).toHaveTextContent('Idle');
    expect(dialog.getByText('Centre Active')).toBeInTheDocument();
    expect(dialog.getByText('Fault (1)')).toBeInTheDocument();

    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
