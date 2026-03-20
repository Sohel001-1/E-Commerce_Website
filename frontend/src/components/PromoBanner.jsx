import React from 'react';
import { assets } from '../assets/assets';

const PromoBanner = () => {
  return (
    <div className="w-screen relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] my-12 cursor-pointer hover:opacity-95 transition-opacity duration-300">
      <img 
        src={assets.promo_banner} 
        alt="Our Collection For Modern Hybrid Vehicle" 
        className="w-full h-auto object-cover shadow-sm rounded sm:rounded-none"
      />
    </div>
  );
};

export default PromoBanner;
