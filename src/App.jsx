import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceAreas from "./pages/ServiceAreas";
import RequestCare from "./pages/RequestCare";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Resources from "./pages/Resources";
import ResourceArticle from "./pages/ResourceArticle";
import Privacy from "./pages/Privacy";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    element: <PageShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/services", element: <Services /> },
      { path: "/services/:slug", element: <ServiceDetail /> },
      { path: "/service-areas", element: <ServiceAreas /> },
      { path: "/request-care", element: <RequestCare /> },
      { path: "/contact", element: <Contact /> },
      { path: "/careers", element: <Careers /> },
      { path: "/resources", element: <Resources /> },
      { path: "/resources/:slug", element: <ResourceArticle /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/reviews", element: <Reviews /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
