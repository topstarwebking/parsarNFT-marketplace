import Index from "./pages/Index";
import Purchased from "./pages/purchased";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";

const routes = [
  { path: "/", component: <Index /> },
  { path: "/purchased", component: <Purchased /> },
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/create", component: <Create /> },
  { path: "/contact", component: <Contact /> },
  { path: "/community", component: <HelpCenter /> },
];

export default routes;