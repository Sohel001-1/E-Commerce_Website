import React from 'react';
import Hero from '../components/Hero';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import CategorySection from '../components/CategorySection';
import PromoBanner from '../components/PromoBanner';
import InquiryBanner from '../components/InquiryBanner';

const Home = () => {
  return (
    <div>
      <Hero />

      {/* Featured Section */}
      <BestSeller />

      {/* Dynamic Sections: These pull directly from MongoDB. 
          Ensure the 'categoryName' matches the 'category' string 
          saved via your productController exactly.
      */}
      <CategorySection categoryName="Filters" sectionTitle="Filters" />
      <CategorySection categoryName="Oils and Fluids" sectionTitle="Oils and Fluids" />
      <CategorySection categoryName="Wheels" sectionTitle="Wheels" />
      <CategorySection categoryName="Ignition" sectionTitle="Ignition" />
      
      {/* Promo Banner between Ignition and Body */}
      <PromoBanner />

      <CategorySection categoryName="Body" sectionTitle="Body" />

      {/* Customer Inquiry Banner */}
      <InquiryBanner />

      {/* Footer / Utility Sections */}
      <OurPolicy />
      <NewsletterBox />
    </div>
  )
}

export default Home;