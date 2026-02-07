import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"JAPAN AUTOS"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[520px] rounded-xl object-cover shadow-sm"
          src={assets.about_img}
          alt="Japan Autos - Auto Parts"
        />

        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            At <span className="font-semibold text-gray-800">JAPAN AUTOS</span>,
            we specialize in reliable, high-quality{" "}
            <span className="font-semibold text-gray-800">car parts</span> for
            everyday drivers and enthusiasts alike. From essential maintenance
            items to performance components, we focus on parts you can trust —
            built for safety, durability, and long-term value.
          </p>

          <p>
            We work with trusted suppliers and carefully verify products to
            ensure consistency and authenticity. Whether you’re repairing,
            upgrading, or maintaining your car, our goal is to make finding the
            right parts simple, fast, and worry-free.
          </p>

          <div>
            <b className="text-gray-800">Our Mission</b>
            <p className="mt-2">
              To deliver a smooth shopping experience and dependable auto parts
              at fair prices — backed by support you can count on, from product
              selection to delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
            <div className="rounded-lg border p-3">
              <b className="text-gray-800">Authentic Parts</b>
              <p className="text-gray-500 mt-1">Verified & trusted supply.</p>
            </div>
            <div className="rounded-lg border p-3">
              <b className="text-gray-800">Fast Dispatch</b>
              <p className="text-gray-500 mt-1">Quick processing & shipping.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality You Can Trust:</b>
          <p className="text-gray-500">
            We prioritize reliable parts by working with trusted sources and
            maintaining consistent quality checks.
          </p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Easy Shopping Experience:</b>
          <p className="text-gray-500">
            Find what you need quickly with clear categories, smooth browsing,
            and a simple checkout flow.
          </p>
        </div>

        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Customer Support:</b>
          <p className="text-gray-500">
            Need help choosing the right part? We’re here to guide you and make
            sure you buy with confidence.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;
