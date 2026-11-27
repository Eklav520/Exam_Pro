import { screen, within } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

async function openMapping() {
  const app = renderApp({ route: path.adminMonitoring, as: 'u-admin' });
  await screen.findByRole('table', { name: 'Candidates' });
  return app;
}

async function openSystems() {
  const app = renderApp({ route: path.adminCentres, as: 'u-admin' });
  await app.user.click(await screen.findByRole('tab', { name: 'Centres & Systems' }));
  await screen.findByRole('table', { name: 'Centres' });
  return app;
}

const rowsOf = (table: string) =>
  within(screen.getByRole('table', { name: table }))
    .getAllByRole('row')
    .slice(1);

const showOnly = (user: Awaited<ReturnType<typeof openMapping>>['user'], view: RegExp) =>
  user.click(
    within(screen.getByRole('group', { name: 'Show candidates' })).getByRole('button', {
      name: view,
    }),
  );

describe('student system mapping', () => {
  it('summarises the session and shows each candidate’s preferences and seat', async () => {
    await openMapping();
    expect(screen.getByText('14 of 20 candidates mapped')).toBeInTheDocument();
    const group = within(screen.getByRole('group', { name: 'Show candidates' }));
    expect(group.getByRole('button', { name: 'All 20' })).toHaveAttribute('aria-pressed', 'true');
    expect(group.getByRole('button', { name: 'Not Mapped 6' })).toBeInTheDocument();
    expect(group.getByRole('button', { name: 'Faulty PC 5' })).toBeInTheDocument();

    const row = screen.getByRole('row', { name: /Lakshmi Prasanna/ });
    for (const text of ['1st: Centre B', '2nd: Centre A', 'NTR', 'PC-11', 'B-011', 'Fault']) {
      expect(row).toHaveTextContent(text);
    }
  });

  it('switches views, searches, and filters by state, district and centre', async () => {
    const { user } = await openMapping();
    await showOnly(user, /^Not Mapped/);
    expect(rowsOf('Candidates')).toHaveLength(6);
    await showOnly(user, /^All/);

    await user.type(screen.getByLabelText('Search candidates'), '9848');
    expect(rowsOf('Candidates')).toHaveLength(20);
    await user.clear(screen.getByLabelText('Search candidates'));
    await user.type(screen.getByLabelText('Search candidates'), 'EXM20260009');
    expect(rowsOf('Candidates')).toHaveLength(1);
    await user.clear(screen.getByLabelText('Search candidates'));

    // The location filters stay out of the way until asked for.
    expect(screen.queryByLabelText('District')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await user.selectOptions(screen.getByLabelText('State'), 'Andhra Pradesh');
    expect(
      within(screen.getByLabelText('District')).queryByRole('option', { name: 'Hyderabad' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('District'), 'Visakhapatnam');
    // Four seated there, and one who has not been mapped but chose it first.
    expect(rowsOf('Candidates')).toHaveLength(5);
    expect(screen.getByRole('button', { name: /Filters 2/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(rowsOf('Candidates')).toHaveLength(20);
  });

  it('auto-maps candidates to their first preferred centre with a free working computer', async () => {
    const { user } = await openMapping();
    await user.click(screen.getByRole('button', { name: 'Auto-map by Preference (6)' }));
    expect(screen.getByRole('button', { name: 'Auto-map by Preference (0)' })).toBeDisabled();
    expect(screen.getByText('20 of 20 candidates mapped')).toBeInTheDocument();
    // 1st choice Centre D, whose PC-08 is faulty and PC-12 taken.
    expect(screen.getByRole('row', { name: /Suresh Babu/ })).toHaveTextContent('PC-01');
    // 1st choice Hyderabad is offline, so the 2nd choice is used.
    const naveen = screen.getByRole('row', { name: /Naveen Kumar/ });
    expect(naveen).toHaveTextContent('Centre A');
    expect(naveen).toHaveTextContent('PC-02');
  });

  it('lets the Admin correct details and map a candidate by hand', async () => {
    const { user } = await openMapping();
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
    const { user } = await openMapping();
    await user.click(screen.getByRole('button', { name: 'View Sravani Devi' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Sravani Devi' }));
    expect(dialog.getByText('CEN-D-PC-08')).toBeInTheDocument();
    expect(dialog.getByText('Centre D (CEN-D), Gajuwaka')).toBeInTheDocument();
    expect(dialog.getByRole('alert')).toHaveTextContent('computer has a fault');
    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('centre systems', () => {
  it('lists every centre with its state, district and computer counts', async () => {
    await openSystems();
    expect(rowsOf('Centres')).toHaveLength(8);
    expect(screen.getByText('All states · 8 centres in 6 districts')).toBeInTheDocument();
    const centreF = screen.getByRole('row', { name: /Centre F/ });
    expect(centreF).toHaveTextContent('Guntur');
    expect(centreF).toHaveTextContent('Needs Attention');
    expect(screen.getByRole('row', { name: /Centre H/ })).toHaveTextContent('Offline');
  });

  it('opens a centre’s computers from the eye icon', async () => {
    const { user } = await openSystems();
    await user.click(screen.getByRole('button', { name: 'View systems of Centre D' }));
    const dialog = within(
      screen.getByRole('dialog', { name: 'Centre D – Live System Monitoring' }),
    );
    expect(dialog.getByText('PC-08').closest('li')).toHaveTextContent('Fault');
    expect(dialog.getByText('Centre Active')).toBeInTheDocument();
    await user.click(dialog.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
