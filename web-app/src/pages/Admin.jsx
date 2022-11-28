import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
const contractAddress = "0x32C22914978451Ded5a17B3c1336eD70aeBDb902";

const Admin = () => {
  const [address, setAddress] = useState("");
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function verifyOrg() {
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
      const transaction = await contract.verifyOrganization(address);
      await transaction.wait();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await toast.promise(verifyOrg(), {
        pending: "updating.....",
        success: "organization verified👌",
        error: "unable to verify 🤯",
      });
      setAddress("");
    } catch (err) {
      console.log(err);
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
        verify Organization
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
            verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
