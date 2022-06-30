import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

import Index from "./pages/Index";
import Purchased from "./pages/purchased";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import Details from "./pages/Details";

function App() {
  const [provider, setProvider] = useState();
  return (
    <div>
      <Header setProvider={setProvider} />
      <Routes>
        <Route
          path="/"
          element={<Index provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/purchased"
          element={<Purchased provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/dashboard"
          element={<Dashboard provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/create"
          element={<Create provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/contact"
          element={<Contact />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/community"
          element={<HelpCenter provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        <Route
          path="/details/:tokenId"
          element={<Details provider={provider} />}
          onUpdate={() => window.scrollTo(0, 0)}
          exact={true}
        />
        {/* {routes.map((data, index) => (
            <Route
              onUpdate={() => window.scrollTo(0, 0)}
              exact={true}
              path={data.path}
              element={data.component}
              key={index}
            />
          ))} */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
