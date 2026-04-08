import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/home/HomePage.jsx";
import ProjectListPage from "./projects/ProjectListPage.jsx";
import AutoInvestPage from "./pages/AutoInvestPage/AutoInvestPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectListPage />} />
      <Route path="/projects/autoInvest" element={<AutoInvestPage />} />
    </Routes>
  );
}
