import React from 'react';
import Hero from '../components/Hero';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import CategorySection from '../components/CategorySection';


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
      <CategorySection categoryName="Autodetailing" sectionTitle="Auto Detailing and Care" />
      <CategorySection categoryName="Engine Oil" sectionTitle="Engine Oil" />
      <CategorySection categoryName="Filters" sectionTitle="Filters" />
      <CategorySection categoryName="Brake" sectionTitle="Brakes" />
      <CategorySection categoryName="Damping" sectionTitle="Damping" />
      <CategorySection categoryName="Ignition" sectionTitle="Ignition" />

      {/* Footer / Utility Sections */}
      <OurPolicy />
      <NewsletterBox />
    </div>
  )
}

export default Home;