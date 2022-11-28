import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
const contractAddress = "0x32C22914978451Ded5a17B3c1336eD70aeBDb902";

function StudentRegister() {
  const [input, setInput] = useState({
    aadhar: "",
    account: "",
  });

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function registerStudent() {
    if (!input.aadhar || !input.account) return;
    if (!typeof window.ethereum !== "undefined") {
      console.log("registering:", input.aadhar, input.account);
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      const transaction = await contract.registerStudent(
        input.aadhar,
        input.account
      );
      await transaction.wait();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await toast.promise(registerStudent(), {
        pending: "registering.....",
        success: "registration successful👌",
        error: "registration failed 🤯",
      });
      setInput({ aadhar: "", account: "" });
    } catch (err) {
      console.log("error happened", err);
      const reason = err.reason.split("'")[1] ?? err.reason;
      toast.error(reason);
      console.log("error:", reason);
    }
  }

  return (
    <div
      className="min-h-screen bg-yellow-200  w-full pb-5"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <p className="text-center font-bold text-white text-2xl pt-5 mb-5 uppercase">
        student registration
      </p>
      <div className="block mx-auto p-6 rounded-lg shadow-lg bg-white max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label
              for="exampleInputEmail2"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              Unique Id(aadhar)
            </label>
            <input
              type="number"
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
              id="exampleInputEmail2"
              aria-describedby="aadhar no."
              placeholder="Enter aadhar no."
              value={input.aadhar}
              onChange={(e) => setInput({ ...input, aadhar: e.target.value })}
            />
          </div>
          <div className="form-group mb-6">
            <label
              for="exampleInputPassword2"
              className="form-label inline-block mb-2 text-gray-700 capitalize"
            >
              account no.
            </label>
            <input
              type="number"
              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              id="account"
              placeholder="enter account no"
              value={input.account}
              onChange={(e) => setInput({ ...input, account: e.target.value })}
            />
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

export default StudentRegister;
