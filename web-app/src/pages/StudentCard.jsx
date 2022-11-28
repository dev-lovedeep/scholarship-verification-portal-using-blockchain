import React, { useState } from "react";
import { ethers } from "ethers";
import ScholorshipPortal from "../artifacts/contracts/ScholorshipPortal.sol/ScholorshipPortal.json";
import { toast } from "react-toastify";
const contractAddress = "0x32C22914978451Ded5a17B3c1336eD70aeBDb902";
const StudentCard = ({ data, org, fetchStudentDetail }) => {
  const [txn, setTxn] = useState("");

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function lockProfile() {
    console.log("calling lock profile");
    if (!typeof window.ethereum !== "undefined") {
      await requestAccount();
      if (!org.isVerified) {
        toast.error("org not verified");
        return;
      }
      //private agency do not need lock
      if (!org.isGov) return;

      if (org.isGov && data.lock) {
        toast.error("student is being processed by a gov agency");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      try {
        const transaction = await contract.lockProfile(data.aadhar);
        await toast.promise(transaction.wait(), {
          pending: "updating.....",
          success: "profile locked👌",
          error: "error occured 🤯",
        });
        console.log("lock aquired");
        await toast.promise(fetchStudentDetail(data.aadhar), {
          pending: "updating UI.....",
          success: "updated👌",
          error: "error occured 🤯",
        });
        console.log("updated UI");
      } catch (err) {
        console.log("error", err);
        const reason = err.reason.split("'")[1] ?? err.reason;
        toast.error(reason);
      }
    }
  }
  async function verifyTxn() {
    console.log("verifying txn..");
    if (!typeof window.ethereum !== "undefined") {
      await requestAccount();
      if (!org.isVerified) {
        toast.error("org not verified");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ScholorshipPortal.abi,
        signer
      );
      const transaction = await contract.verifyPayment(
        data.aadhar,
        data.accNum,
        txn
      );
      await transaction.wait();
      console.log("verified");
    }
  }
  async function handleVerification(e) {
    e.preventDefault();
    try {
      await toast.promise(verifyTxn(), {
        pending: "verifing.....",
        success: "updated successfully👌",
        error: "error occured 🤯",
      });
      setTxn("");
    } catch (err) {
      console.log("error", err);
      const reason = err.reason.split("'")[1] ?? err.reason;
      toast.error(reason);
    }
  }

  return (
    <div>
      <div class="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow shadow-slate-300">
        <div class="flex flex-row justify-between items-center">
          <div>
            <h1 class="text-3xl font-medium">Student Details</h1>
          </div>
          <div class="inline-flex space-x-2 items-center">
            {org && org.isGov && data && (
              <a
                href="#"
                className={`p-2 border border-slate-200 rounded-md inline-flex space-x-1 items-center text-white ${
                  data.lock ? "bg-red-600" : "bg-green-400"
                }`}
              >
                <span class="text-sm font-medium hidden md:block capitalize">
                  {data.lock ? "locked" : "open"}
                </span>
              </a>
            )}
          </div>
        </div>

        {org && data && (!org.isGov || (org.isGov && !data.lock)) && (
          <div>
            <div id="tasks" class="my-5">
              <div
                id="task"
                class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
              >
                <div class="inline-flex justify-between space-x-2 w-full">
                  <p class="text-slate-500">aadhar</p>
                  <p class="text-slate-500">{Number(data.aadhar)}</p>
                </div>
              </div>
              <div
                id="task"
                class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
              >
                <div class="inline-flex justify-between space-x-2 w-full">
                  <p class="text-slate-500">Received govt. Scholarship</p>
                  <p class="text-slate-500">
                    {data.receivedGovScholorship ? "true" : "false"}
                  </p>
                </div>
              </div>
              <div
                id="task"
                class="flex justify-between items-center border-b border-slate-200 py-3 px-2 border-l-4  border-l-transparent"
              >
                <div class="inline-flex justify-between space-x-2 w-full">
                  <p class="text-slate-500">Account number</p>
                  <p class="text-slate-500">{Number(data.accNum)}</p>
                </div>
              </div>
            </div>
            {org && org.isGov && (
              <button
                onClick={lockProfile}
                disabled={
                  org.isGov && (data.lock || data.receivedGovScholorship)
                }
                class="p-2 border w-full mx-auto text-center border-slate-200 rounded-md inline-flex space-x-1 items-center text-indigo-200 hover:text-white bg-indigo-600 hover:bg-indigo-500"
              >
                <span class="text-sm mx-auto capitalize font-medium hidden text-center md:block">
                  {data.lock && <p>alrady under process</p>}
                  {data.receivedGovScholorship && (
                    <p>already received govt. scholorship </p>
                  )}
                  {!data.lock && !data.receivedGovScholorship && (
                    <p>select for scholorship</p>
                  )}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {org && data && (!org.isGov || data.lock) && (
        <div className="block mx-auto p-6 rounded-lg shadow-lg bg-white max-w-md">
          <form onSubmit={handleVerification}>
            <div className="form-group mb-6">
              <label
                for="exampleInputEmail2"
                className="form-label inline-block mb-2 text-gray-700 capitalize"
              >
                enter transaction id to verify payment for student{" "}
                {`${data.aadhar}`}
              </label>
              <input
                type="text"
                value={txn}
                onChange={(e) => setTxn(e.target.value)}
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
                id="transact"
                aria-describedby="transaction id"
                placeholder="transaction id"
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
      )}
    </div>
  );
};

export default StudentCard;
