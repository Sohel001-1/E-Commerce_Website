import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
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
              <Link to="/" className="hover:text-orange-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-orange-600 transition-colors">
                About us
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-orange-600 transition-colors">
                Delivery Info
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-600 transition-colors">
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
        <hr className="border-gray-200" />
        <p className='py-5 text-sm text-center text-gray-400'>Copyright 2024@ japanautos.com - All Right Reserved.</p>
      </div>
    </motion.div>
  );
};

export default Footer;
