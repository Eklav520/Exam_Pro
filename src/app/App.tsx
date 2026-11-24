import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './router/routes';
import { makeStore } from './store';

const store = makeStore();
const router = createBrowserRouter(routes);

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
