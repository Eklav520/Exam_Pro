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
