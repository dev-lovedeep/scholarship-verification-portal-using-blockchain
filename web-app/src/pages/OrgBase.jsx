import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/bg.jpg";
const OrgBase = () => {
  return (
    <div
      className="min-h-screen w-full flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="flex flex-col justify-center space-y-2 text-center mt-4">
        <li className="inline-block relative">
          <Link
            className="bg-white rounded-md  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
            to="register"
          >
            register organization
          </Link>
        </li>
        <li className="inline-block relative">
          <Link
            className="bg-white rounded-md  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
            to="student-details"
          >
            view student details
          </Link>
        </li>
        <li className="inline-block relative">
          <Link
            className="bg-white rounded-md  px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
            to="details"
          >
            view organization details
          </Link>
        </li>
      </div>
    </div>
  );
};

export default OrgBase;
