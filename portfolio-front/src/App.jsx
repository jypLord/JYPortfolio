import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./home/HomePage.jsx";
import ProjectListPage from "./projects/ProjectListPage.jsx";
import AutoInvestPage from "./projects/autoInvest/AutoInvestPage.jsx";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/autoInvest" element={<AutoInvestPage />} />
        </Routes>
      </BrowserRouter>
  );
}