import React, { Suspense, lazy, useEffect, useState } from "react";
import Hero from "../components/Hero";
import BestSeller from "../components/BestSeller";

const OurPolicy = lazy(() => import("../components/OurPolicy"));
const NewsletterBox = lazy(() => import("../components/NewsletterBox"));
const CategorySection = lazy(() => import("../components/CategorySection"));
const PromoBanner = lazy(() => import("../components/PromoBanner"));
const InquiryBanner = lazy(() => import("../components/InquiryBanner"));

const DeferredSectionFallback = () => (
  <div className="my-16 h-32 rounded-2xl skeleton-pulse" />
);

const Home = () => {
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          setShowDeferredSections(true);
        },
        { timeout: 1000 },
      );
    } else {
      timeoutId = window.setTimeout(() => {
        setShowDeferredSections(true);
      }, 300);
    }

    return () => {
      if (idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div>
      <Hero />

      {/* Featured Section */}
      <BestSeller />

      <Suspense fallback={<DeferredSectionFallback />}>
        {showDeferredSections && (
          <>
            {/* Dynamic Sections: These pull directly from MongoDB. 
                Ensure the 'categoryName' matches the 'category' string 
                saved via your productController exactly.
            */}
            <CategorySection categoryName="Filters" sectionTitle="Filters" />
            <CategorySection
              categoryName="Oils and Fluids"
              sectionTitle="Oils and Fluids"
            />
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
          </>
        )}
      </Suspense>
    </div>
  );
};

export default Home;
