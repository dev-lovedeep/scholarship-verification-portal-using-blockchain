import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
const contractAddress = import.meta.env.VITE_contractAddress;
import bg from "../assets/bg.jpg";
const OrgDetail = () => {
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState({});

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function fetchOrgDetail() {
    if (!address) return;
    if (!typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      const details = await contract.getOrganizationDetail(address);
      return details;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await toast.promise(fetchOrgDetail(), {
        pending: "fetching.....",
        success: "details found👌",
        error: "error occured 🤯",
      });
      console.log("response:", data);
      setAddress("");
      setDetails(data);
    } catch (err) {
      console.log(err);
      const reason = err.reason.split("'")[1] ?? err.reason;
      toast.error(reason);
    }
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div
      className="min-h-screen bg-yellow-200  w-full pb-5"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <p className="text-center text-white font-bold text-2xl pt-5 mb-5 uppercase">
        view Organization details
      </p>
      <div className="block mx-auto p-6 rounded-lg shadow-lg bg-white max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label
              for="exampleInputEmail2"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              Enter organization address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              id="address"
              aria-describedby="address"
              placeholder="Enter address"
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
      {Object.keys(details).length && (
        <div>
          <div class="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300">
            <div class="flex flex-row justify-between items-center">
              <div>
                <h1 class="text-3xl font-medium">Oraganization Details</h1>
              </div>
            </div>

            <div>
              <div id="tasks" class="my-5">
                <div
                  id="task"
                  class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
                >
                  <div class="inline-flex justify-between space-x-2 w-full">
                    <p class="text-slate-500">name</p>
                    <p class="text-slate-500">{details.name}</p>
                  </div>
                </div>
                <div
                  id="task"
                  class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
                >
                  <div class="inline-flex justify-between space-x-2 w-full">
                    <p class="text-slate-500">isGov</p>
                    <p class="text-slate-500">
                      {details.isGov ? "true" : "false"}
                    </p>
                  </div>
                </div>
                <div
                  id="task"
                  class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
                >
                  <div class="inline-flex justify-between space-x-2 w-full">
                    <p class="text-slate-500">isVerified</p>
                    <p class="text-slate-500">
                      {details.isVerified ? "true" : "false"}
                    </p>
                  </div>
                </div>
                <div
                  id="task"
                  class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
                >
                  <div class="inline-flex justify-between space-x-2 w-full">
                    <p class="text-slate-500">fund Sanctioned</p>
                    <p class="text-slate-500">
                      {formatter.format(Number(details.fundSanctioned))}
                    </p>
                  </div>
                </div>
                <div
                  id="task"
                  class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
                >
                  <div class="inline-flex justify-between space-x-2 w-full">
                    <p class="text-slate-500">fund distributed</p>
                    <p class="text-slate-500">
                      {formatter.format(Number(details.fundDistributed))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDetail;
