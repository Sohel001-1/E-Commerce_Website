import React, { Suspense, lazy } from 'react';
import Hero from '../components/Hero';
import BestSeller from '../components/BestSeller';
import CategorySection from '../components/CategorySection';

const OurPolicy = lazy(() => import('../components/OurPolicy'));
const NewsletterBox = lazy(() => import('../components/NewsletterBox'));
const InquiryBanner = lazy(() => import('../components/InquiryBanner'));

const featuredCategories = [
  { categoryName: "Filters", sectionTitle: "Filters" },
  { categoryName: "Oils and Fluids", sectionTitle: "Oils and Fluids" },
  { categoryName: "Wheels", sectionTitle: "Wheels" },
  { categoryName: "Ignition", sectionTitle: "Ignition" },
  { categoryName: "Body", sectionTitle: "Body" },
];

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
      {featuredCategories.map((section) => (
        <CategorySection
          key={section.categoryName}
          categoryName={section.categoryName}
          sectionTitle={section.sectionTitle}
        />
      ))}

      {/* Customer Inquiry Banner */}
      <Suspense fallback={null}>
        <InquiryBanner />
      </Suspense>

      {/* Footer / Utility Sections */}
      <Suspense fallback={null}>
        <OurPolicy />
        <NewsletterBox />
      </Suspense>
    </div>
  )
}

export default Home;
