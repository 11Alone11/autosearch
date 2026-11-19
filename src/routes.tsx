import type { RouteObject } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { LotsPage } from './pages/LotsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SavedSearchesPage } from './pages/SavedSearchesPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LotsPage /> },
      { path: 'searches', element: <SavedSearchesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
