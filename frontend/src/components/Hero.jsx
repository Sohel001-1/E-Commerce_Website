import { useCallback, useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// 1. Video served from public folder
import { assets } from "../assets/assets";

const fallbackSlides = [
  {
    type: "image",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000",
    title: "Top-Grade Motor Oil",
    subtitle: "Clean emissions with authentic lubricants",
    cta: "View Oils",
    category: "Oils and Fluids"
  },
  {
    type: "image",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000",
    title: "Genuine Engine Parts",
    subtitle: "OEM quality components for peak performance",
    cta: "Shop Engine Parts",
    category: "Engine"
  },
  {
    type: "image",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000",
    title: "Premium Brake Systems",
    subtitle: "Safety first with authentic components",
    cta: "Browse Brakes",
    category: "Brakes"
  },
  {
    type: "image",
    image: assets.hero_suspension,
    title: "Suspension Components",
    subtitle: "Ensure a smooth and stable ride",
    cta: "View Suspension",
    category: "Suspension"
  },
  {
    type: "image",
    image: assets.hero_transmission,
    title: "Transmission Systems",
    subtitle: "Power the roads seamlessly",
    cta: "View Transmission",
    category: "Transmission"
  },
  {
    type: "image",
    image: assets.hero_filter,
    title: "Filters",
    subtitle: "Clean engine operations",
    cta: "Shop Filters",
    category: "Filters"
  },
  {
    type: "image",
    image: assets.hero_lighting,
    title: "Lighting",
    subtitle: "Illuminate your journey",
    cta: "View Lighting",
    category: "Lighting"
  },
  {
    type: "image",
    image: assets.hero_detailing,
    title: "Auto Detailing",
    subtitle: "Keep your car looking brand new",
    cta: "View Detailing",
    category: "Auto Detailing and Care"
  }
];

export default function HeroSlider() {
  const { backendUrl } = useContext(ShopContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/banner/list");
        if (response.data.success && response.data.banners.length > 0) {
          setSlides(response.data.banners);
        } else {
          setSlides(fallbackSlides);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };
    if (backendUrl) {
      fetchBanners();
    }
  }, [backendUrl]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const heroRef = useRef(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (loading) {
    return (
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-0 bg-white">
        <div className="flex justify-center w-full">
          <div className="w-full aspect-[21/9] bg-gray-200/50 animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section ref={heroRef} className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-white pb-8">
      {/* Full-Width Image Slider */}
      <div className="overflow-visible w-full" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0 relative">
              {slide.type === "video" ? (
                <video
                  src={slide.videoSource}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto block object-contain bg-black"
                />
              ) : slide.type === "icon" ? (
                <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8 text-[#E85D04]">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-1/2 h-1/2 object-contain drop-shadow-2xl opacity-50 contrast-125 saturate-200"
                  />
                </div>
              ) : (
                <Link to={slide.category ? `/collection?category=${encodeURIComponent(slide.category)}` : '#'}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-auto block object-contain"
                  />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Text & CTA Section */}
      <div className="mt-8 md:mt-12 text-center px-4 flex flex-col justify-center items-center min-h-[160px]">
        {slides[selectedIndex]?.title && (
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tighter" 
            style={{ transform: "scaleY(1.1)" }}
          >
            {slides[selectedIndex].title}
          </h2>
        )}
        {slides[selectedIndex]?.subtitle && (
          <p className="text-sm sm:text-base md:text-xl text-gray-800 tracking-wide mt-3 md:mt-4 font-medium">
            {slides[selectedIndex].subtitle}
          </p>
        )}
        {slides[selectedIndex]?.cta && (
          <div className="mt-6 md:mt-8">
            <Link to={slides[selectedIndex].category ? `/collection?category=${encodeURIComponent(slides[selectedIndex].category)}` : '#'}>
              <button className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-8 py-3 rounded-full font-bold uppercase transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs sm:text-sm tracking-widest cursor-pointer">
                {slides[selectedIndex].cta}
              </button>
            </Link>
          </div>
        )}
      </div>

    </section>
  );
}