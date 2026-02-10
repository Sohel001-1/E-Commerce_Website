import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight, staggerContainer, staggerItem } from "../utils/animations";

const About = () => {
  return (
    <div>
      <motion.div className="text-2xl text-center pt-8" {...fadeUp}>
        <Title text1={"ABOUT"} text2={"JAPAN AUTOS"} />
      </motion.div>

      <div className="my-10 flex flex-col md:flex-row gap-12 lg:gap-16">
        <motion.img
          className="w-full md:max-w-[520px] rounded-3xl object-cover shadow-glass-lg"
          src={assets.about_img}
          alt="Japan Autos - Auto Parts"
          {...slideLeft}
        />

        <motion.div
          className="flex flex-col justify-center gap-6 md:w-2/4 text-surface-500"
          {...slideRight}
        >
          <p className="leading-relaxed">
            At <span className="font-bold text-surface-800">JAPAN AUTOS</span>,
            we specialize in reliable, high-quality{" "}
            <span className="font-bold text-surface-800">car parts</span> for
            everyday drivers and enthusiasts alike. From essential maintenance
            items to performance components, we focus on parts you can trust —
            built for safety, durability, and long-term value.
          </p>

          <p className="leading-relaxed">
            We work with trusted suppliers and carefully verify products to
            ensure consistency and authenticity. Whether you're repairing,
            upgrading, or maintaining your car, our goal is to make finding the
            right parts simple, fast, and worry-free.
          </p>

          <div>
            <b className="font-display text-surface-800">Our Mission</b>
            <p className="mt-2 leading-relaxed">
              To deliver a smooth shopping experience and dependable auto parts
              at fair prices — backed by support you can count on, from product
              selection to delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
            <div className="glass-card-hover p-5">
              <b className="font-display text-surface-800">Authentic Parts</b>
              <p className="text-surface-400 mt-1">Verified & trusted supply.</p>
            </div>
            <div className="glass-card-hover p-5">
              <b className="font-display text-surface-800">Fast Dispatch</b>
              <p className="text-surface-400 mt-1">Quick processing & shipping.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="text-xl py-4" {...fadeUp}>
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row text-sm mb-20 gap-4"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {[
          {
            title: "Quality You Can Trust",
            desc: "We prioritize reliable parts by working with trusted sources and maintaining consistent quality checks.",
          },
          {
            title: "Easy Shopping Experience",
            desc: "Find what you need quickly with clear categories, smooth browsing, and a simple checkout flow.",
          },
          {
            title: "Customer Support",
            desc: "Need help choosing the right part? We're here to guide you and make sure you buy with confidence.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="flex-1 glass-card-hover p-8 sm:p-10 flex flex-col gap-4"
          >
            <b className="font-display text-surface-800 text-base">{item.title}</b>
            <p className="text-surface-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <NewsletterBox />
    </div>
  );
};

export default About;
