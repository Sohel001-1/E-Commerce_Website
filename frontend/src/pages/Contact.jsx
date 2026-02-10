import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight } from "../utils/animations";

const Contact = () => {
  return (
    <div>
      <motion.div className="text-center text-2xl pt-10" {...fadeUp}>
        <Title text1={"CONTACT"} text2={"US"} />
      </motion.div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <motion.img
          className="w-full md:max-w-[480px] rounded-3xl shadow-glass-lg object-cover"
          src={assets.contact_img}
          alt="contact"
          {...slideLeft}
        />
        <motion.div
          className="flex flex-col justify-center items-start gap-6"
          {...slideRight}
        >
          <p className="font-display font-bold text-xl text-surface-800">Our Store</p>
          <p className="text-surface-500 leading-relaxed">
            123 Auto Parts Street <br /> Tokyo, Japan 100-0001
          </p>
          <p className="text-surface-400 leading-relaxed">
            Tel: 02-1234-5678 <br /> Email: japanautos@gmail.com
          </p>
          <p className="font-display font-bold text-xl text-surface-600">
            JAPAN AUTOS
          </p>
          <p className="text-surface-500">
            Learn more about our teams and job openings.
          </p>
          <motion.button
            className="btn-secondary text-sm px-8 py-4"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Store
          </motion.button>
        </motion.div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
