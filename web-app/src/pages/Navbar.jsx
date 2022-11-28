import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [accountAddress, setAccountAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [haveMetamask, sethaveMetamask] = useState(true);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };
  return (
    <nav className="relative w-full flex flex-wrap items-center justify-between bg-blueGray-800">
      <div className="container px-4 py-2 top-0 sticky bg-gray-800 w-full  flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static  lg:justify-start ">
          <Link
            className="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white"
            to="/"
          >
            Scholars 2.0
          </Link>
          <button
            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
            type="button"
            onclick="toggleNavbar('example-collapse-navbar')"
          >
            <i className="text-white fas fa-bars"></i>
          </button>
        </div>
        <div
          className="lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none hidden bg-blueGray-800"
          id="example-collapse-navbar"
        >
          <ul className="flex flex-col lg:flex-row list-none lg:ml-auto items-center">
            <li className="inline-block relative">
              <Link
                className="text-white  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                to="/student"
              >
                student
              </Link>
            </li>
            <li className="inline-block relative">
              <Link
                className="text-white  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                to="/org"
              >
                organization
              </Link>
            </li>
            <li className="inline-block relative">
              <Link
                className="text-white  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                to="/admin"
              >
                admin
              </Link>
            </li>

            <li className="flex items-center">
              <button
                onClick={connectWallet}
                className="bg-white text-blueGray-700 active:bg-blueGray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                disabled={isConnected}
              >
                <i className="fas fa-arrow-alt-circle-down"></i>{" "}
                {isConnected ? "connected" : "connect"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
