import React from 'react';
import Hero from '../components/Hero';
import EngineOil from '../components/EngineOil';
import Autodetailingandcare from '../components/Autodetailingandcare';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';
import Filters from '../components/Filter';
import Brakes from '../components/Brakes';
import Damping from '../components/Damping';
import Ignition from '../components/Ignition';

const Home = () => {
  return (
    <div>
      <Hero />
      <BestSeller/>
      <Autodetailingandcare/>
      <EngineOil/>
      <Filters/>
      <Brakes/>
      <Damping/>
      <Ignition/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home