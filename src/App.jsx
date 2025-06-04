import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppBar from "./assets/Components/AppBar/AppBar.jsx";
import UnitManager from "./assets/Components/UnitManager";
import ProductManager from "./assets/Components/ProductManager.jsx";
import SolutionManager from "./assets/Components/SolutionManager.jsx";
import StatusManager from "./assets/Components/StatusManager.jsx";
import CateCarManager from "./assets/Components/CateCarManager.jsx";
import RepairContentManager from "./assets/Components/RepairContentManager.jsx";
import CarManager from "./assets/Components/CarManager.jsx";
const Home = () => <></>;

function App() {
  return (
    <Router>
      <AppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/units" element={<UnitManager />} />
        <Route path="/products" element={<ProductManager />} />
        <Route path="/solutions" element={<SolutionManager />} />
        <Route path="/statuses" element={<StatusManager />} />
        <Route path="/catecar" element={<CateCarManager />} />
        <Route path="/repair-contents" element={<RepairContentManager />} />
        <Route path="/cars" element={<CarManager />} />
      </Routes>
    </Router>
  );
}

export default App;
