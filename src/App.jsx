// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AppBar from "./assets/Components/AppBar/AppBar.jsx";
// import UnitManager from "./assets/Components/UnitManager";
// import ProductManager from "./assets/Components/ProductManager.jsx";
// import SolutionManager from "./assets/Components/SolutionManager.jsx";
// import StatusManager from "./assets/Components/StatusManager.jsx";
// import CateCarManager from "./assets/Components/CateCarManager.jsx";
// import RepairContentManager from "./assets/Components/RepairContentManager.jsx";
// import CarManager from "./assets/Components/CarManager.jsx";
// const Home = () => <></>;

// function App() {
//   return (
//     <Router>
//       <AppBar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/units" element={<UnitManager />} />
//         <Route path="/products" element={<ProductManager />} />
//         <Route path="/solutions" element={<SolutionManager />} />
//         <Route path="/statuses" element={<StatusManager />} />
//         <Route path="/catecar" element={<CateCarManager />} />
//         <Route path="/repair-contents" element={<RepairContentManager />} />
//         <Route path="/cars" element={<CarManager />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
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
import LoginPage from "./assets/Components/LoginPage.jsx";
import ProtectedRoute from "./assets/Components/ProtectedRoute.jsx";

function App() {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");
  const isTokenValid = token && expiry && Date.now() < parseInt(expiry);

  return (
    <Router>
      {isTokenValid && <AppBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <UnitManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solutions"
          element={
            <ProtectedRoute>
              <SolutionManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statuses"
          element={
            <ProtectedRoute>
              <StatusManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catecar"
          element={
            <ProtectedRoute>
              <CateCarManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-contents"
          element={
            <ProtectedRoute>
              <RepairContentManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars"
          element={
            <ProtectedRoute>
              <CarManager />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
