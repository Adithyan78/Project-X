import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Project from "./components/Project";
import PurchasePage from "./components/PurchasePage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home (Landing Page) */}
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/purchase/:id" element={<PurchasePage/>} />

        {/* Example placeholders for future pages */}
        
      </Routes>
    </Router>
  );
};

export default App;
