import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";

const Footer = () => {
  return (
    <motion.footer
      {...fadeUp}
      whileInView={fadeUp.animate}
      viewport={{ once: true }}
      className="mt-20"
    >
      <div className="glass-card rounded-3xl p-8 sm:p-12 mb-8">
        <motion.div
          className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div variants={staggerItem}>
            <img src={assets.logo} className="mb-5 w-28" alt="Japan Autos" />
            <p className="w-full md:w-2/3 text-surface-500 leading-relaxed">
              Japan Autos is your trusted source for quality automotive parts and
              accessories. We deliver authentic, reliable parts backed by expert
              support and hassle-free service.
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <p className="text-lg font-display font-bold mb-5 text-surface-800">COMPANY</p>
            <ul className="flex flex-col gap-2 text-surface-500">
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-500 transition-colors duration-300">
                  About us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors duration-300">
                  Delivery Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-500 transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <p className='text-lg font-display font-bold mb-5 text-surface-800'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-surface-500'>
              <li>+1-212-456-7890</li>
              <li>contact@japanautos.com</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      <div className="text-center py-5">
        <p className='text-sm text-surface-400'>Copyright 2024 japanautos.com - All Rights Reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
