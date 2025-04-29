import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import AdminPage from './pages/AdminPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App; 