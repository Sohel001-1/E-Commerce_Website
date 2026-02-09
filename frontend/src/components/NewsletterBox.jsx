import React from "react";
import { motion } from "framer-motion";

const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <motion.div
      className="text-center py-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Stay updated with the latest auto parts, maintenance tips, and exclusive
        offers.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400 focus-within:shadow-lg focus-within:shadow-orange-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
      >
        <input
          className="w-full sm:flex-1 outline-none bg-transparent px-4 py-3.5"
          type="email"
          placeholder="Enter your email"
          required
        />
        <motion.button
          type="submit"
          className="bg-gray-900 text-white text-xs px-8 py-4 hover:bg-orange-600 transition-colors duration-300 font-semibold tracking-wider"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          SUBSCRIBE
        </motion.button>
      </form>
    </motion.div>
  );
};

export default NewsletterBox;
