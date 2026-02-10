import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";

const NewsletterBox = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <motion.div
      className="text-center py-12 my-8"
      {...fadeUp}
      whileInView={fadeUp.animate}
      viewport={{ once: true }}
    >
      <h3 className="text-2xl sm:text-3xl font-display font-bold text-surface-900">
        Subscribe now & get 20% off
      </h3>
      <p className="text-surface-400 mt-3 max-w-md mx-auto">
        Stay updated with the latest auto parts, maintenance tips, and exclusive
        offers.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-0 mx-auto my-8 rounded-2xl overflow-hidden glass-card focus-within:border-orange-300 focus-within:shadow-glow transition-all duration-300"
      >
        <input
          className="w-full sm:flex-1 outline-none bg-transparent px-5 py-4 text-surface-700 placeholder:text-surface-400"
          type="email"
          placeholder="Enter your email"
          required
        />
        <motion.button
          type="submit"
          className="btn-primary btn-shimmer rounded-none rounded-r-2xl text-xs px-8 py-4 font-bold tracking-wider whitespace-nowrap"
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
