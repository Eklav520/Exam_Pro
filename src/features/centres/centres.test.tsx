import { screen } from '@testing-library/react';
import { path } from '@/shared/config/paths';
import { renderApp } from '@/test/renderApp';

describe('centres and systems', () => {
  it('keeps uploads and the centres table on separate tabs', async () => {
    const { user } = renderApp({ route: path.adminCentres, as: 'u-admin' });
    expect(await screen.findByRole('tab', { name: 'Upload & Register' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: /Upload Centres Excel/ })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Centres' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Centres & Systems' }));
    expect(await screen.findByRole('table', { name: 'Centres' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Upload Centres Excel/ })).not.toBeInTheDocument();
  });
});
