import { useState } from "react";
import ConnectWallet from "./pages/ConnectWallet";
import OrgRegister from "./pages/OrgRegister";
import StudentRegister from "./pages/StudentRegister";
import { Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import StudentDetail from "./pages/StudentDetail";
import OrgDetail from "./pages/OrgDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./pages/Navbar";
import OrgBase from "./pages/OrgBase";
import StudentBase from "./pages/StudentBase";
import Home from "./pages/Home";
import AdminBase from "./pages/AdminBase";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/org/register" element={<OrgRegister />} />
        <Route path="/org/student-details" element={<StudentDetail />} />
        <Route path="/org/details" element={<OrgDetail />} />
        <Route path="/org" element={<OrgBase />} />

        {/* <Route path="/student" element={<StudentBase />}> */}
        <Route path="/student" element={<StudentRegister />} />

        <Route path="/admin" element={<Admin />} />
        {/* <Route path="verify-org" element={<Admin />} />
        </Route> */}
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
