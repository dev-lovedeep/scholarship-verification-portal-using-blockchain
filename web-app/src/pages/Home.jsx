import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/bg.jpg";
const Home = () => {
  console.log(import.meta.env.VITE_contractAddress);
  return (
    <div
      className="min-h-screen w-full flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div>
        <ul className="text-white font-bold capitalize text-4xl flex space-x-3">
          <li>safe</li>
          <li>secure</li>
          <li>Transparent</li>
        </ul>
        <div className="flex justify-center space-x-2 mt-4">
          <li className="inline-block relative">
            <Link
              className="bg-white rounded-md  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
              to="/student"
            >
              student
            </Link>
          </li>
          <li className="inline-block relative">
            <Link
              className="bg-white rounded-md  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
              to="/org"
            >
              organization
            </Link>
          </li>
        </div>
      </div>
    </div>
  );
};

export default Home;
