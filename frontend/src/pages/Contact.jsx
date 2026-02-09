import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img
          className="w-full md:max-w-[480px] rounded-lg"
          src={assets.contact_img}
          alt="contact"
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-800">Our Store</p>
          <p className="text-gray-600">
            123 Auto Parts Street <br /> Tokyo, Japan 100-0001
          </p>
          <p className="text-gray-500">
            Tel: 02-1234-5678 <br /> Email: japanautos@gmail.com
          </p>
          <p className="font-semibold text-xl text-gray-600">
            JAPAN AUTOS
          </p>
          <p className="text-gray-600">
            Learn more about our teams and job openings.
          </p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500 rounded-lg">
            Explore Store
          </button>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
