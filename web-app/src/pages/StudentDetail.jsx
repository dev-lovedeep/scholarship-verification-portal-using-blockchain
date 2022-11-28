import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import StudentCard from "./StudentCard";
const contractAddress = import.meta.env.VITE_contractAddress;
const StudentDetail = () => {
  const [aadhar, setAadhar] = useState("");
  const [details, setDetails] = useState(null);
  const [org, setOrg] = useState(null);
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchOrgDetail(address) {
    if (!address) return;
    if (!typeof window.ethereum !== "undefined") {
      // await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      const orgDetails = await contract.getOrganizationDetail(address);
      return orgDetails;
    }
  }

  async function fetchStudentDetail(arg = undefined) {
    if (!aadhar && !arg) return;
    if (!typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      console.log("arg:", arg);
      const details = await contract.getStudentDetail(arg ?? aadhar);
      //get org details
      const orgDetails = await fetchOrgDetail(accounts[0]);
      setOrg(orgDetails);
      //only if this function is called directly
      if (arg) {
        console.log("this should update ui");
        setDetails(details);
      }
      return details;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await toast.promise(fetchStudentDetail(), {
        pending: "fetching.....",
        success: "details found👌",
        error: "error occured 🤯",
      });
      console.log("response:", data);
      setAadhar("");
      setDetails(data);
    } catch (err) {
      console.log("error", err);
      const reason = err.reason.split("'")[1] ?? err.reason;
      toast.error(reason);
    }
  }

  return (
    <div
      className="min-h-screen bg-yellow-200  w-full pb-5"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <p className="text-center text-white font-bold text-2xl pt-5 mb-5 uppercase">
        view Student details
      </p>
      <div className="block mx-auto p-6 rounded-lg shadow-lg bg-white max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label
              for="exampleInputEmail2"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              Enter student Id(aadhar)
            </label>
            <input
              type="number"
              value={aadhar}
              onChange={(e) => setAadhar(e.target.value)}
              className="form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              id="aadhar"
              aria-describedby="aadhar no."
              placeholder="Enter aadhar no."
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          >
            view Details
          </button>
        </form>
      </div>
      {details && Object.keys(details).length && (
        <StudentCard
          data={details}
          org={org}
          fetchStudentDetail={fetchStudentDetail}
        />
      )}
    </div>
  );
};

export default StudentDetail;
