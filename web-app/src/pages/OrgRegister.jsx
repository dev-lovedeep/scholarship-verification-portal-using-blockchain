import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
const contractAddress = import.meta.env.VITE_contractAddress;

function OrgRegister() {
  const [orgDetails, setDetails] = useState({
    name: "",
    isGov: false,
    sanctionAmount: "",
  });

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function registerOrg() {
    console.log("registering org:", orgDetails);
    if (!orgDetails.name || !orgDetails.sanctionAmount) return;
    if (!typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      const transaction = await contract.registerOrganization(
        orgDetails.name,
        orgDetails.isGov,
        orgDetails.sanctionAmount * 1
      );
      await transaction.wait();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await toast.promise(registerOrg(), {
        pending: "registering.....",
        success: "registration successful👌",
        error: "registration failed 🤯",
      });
      setDetails({ name: "", sanctionAmount: "", isGov: false });
    } catch (err) {
      console.log("error happened", err);
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
        Organization registration
      </p>
      <div className="block mx-auto p-6 rounded-lg shadow-lg bg-white max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label
              for="name"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              organization name
            </label>
            <input
              type="text"
              value={orgDetails.name}
              onChange={(e) =>
                setDetails({ ...orgDetails, name: e.target.value })
              }
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
              id="name"
              aria-describedby="organization name"
              placeholder="Enter organization name"
            />
          </div>
          <div className="form-group mb-6">
            <label
              for="amount"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              Total Scholorship amount
            </label>
            <input
              type="number"
              value={orgDetails.sanctionAmount}
              onChange={(e) =>
                setDetails({ ...orgDetails, sanctionAmount: e.target.value })
              }
              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              id="amount"
              placeholder="enter amount sanctioned"
            />
          </div>
          <div class="form-group form-check mb-3">
            <input
              type="checkbox"
              class=" h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
              id="gov"
              checked={orgDetails.isGov}
              onChange={(e) =>
                setDetails({ ...orgDetails, isGov: !orgDetails.isGov })
              }
            />
            <label
              class="form-check-label inline-block text-gray-800"
              for="gov"
            >
              Goverment organization
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrgRegister;
