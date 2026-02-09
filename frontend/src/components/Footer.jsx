import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Japan Autos" />
          <p className="w-full md:w-2/3 text-gray-600">
            Japan Autos is your trusted source for quality automotive parts and
            accessories. We deliver authentic, reliable parts backed by expert
            support and hassle-free service.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <Link to="/" className="hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-900">
                About us
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-gray-900">
                Delivery Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-900">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+1-212-456-7890</li>
                <li>contact@japanautos.com</li>
            </ul>
        </div>
      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ japanautos.com - All Right Reserved.</p>
        </div>

    </div>
  );
};

export default Footer
