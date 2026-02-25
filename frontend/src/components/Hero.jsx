import { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { heroTextVariants } from "../utils/animations";

// 1. Video served from public folder
import { assets } from "../assets/assets";

const slides = [
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
    type: "icon",
    image: assets.suspension,
    title: "Suspension Components",
    subtitle: "Ensure a smooth and stable ride",
    cta: "View Suspension",
    category: "Suspension"
  },
  {
    type: "icon",
    image: assets.transmission,
    title: "Transmission Systems",
    subtitle: "Power the roads seamlessly",
    cta: "View Transmission",
    category: "Transmission"
  },
  {
    type: "icon",
    image: assets.filters,
    title: "Filters",
    subtitle: "Clean engine operations",
    cta: "Shop Filters",
    category: "Filters"
  },
  {
    type: "icon",
    image: assets.lighting,
    title: "Lighting",
    subtitle: "Illuminate your journey",
    cta: "View Lighting",
    category: "Lighting"
  },
  {
    type: "icon",
    image: assets.auto_detailing_and_care,
    title: "Auto Detailing",
    subtitle: "Keep your car looking brand new",
    cta: "View Detailing",
    category: "Auto Detailing and Care"
  }
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const heroRef = useRef(null);
  const [parallaxStyle, setParallaxStyle] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallaxStyle({ x: x * 15, y: y * 10 });
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4"
    >
      <div className="overflow-visible" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="flex-[0_0_85%] sm:flex-[0_0_90%] min-w-0 px-2 relative"
            >
              <div className="relative h-[400px] md:h-[550px] overflow-hidden rounded-3xl shadow-glass-lg group">

                {/* 2. Conditional Rendering for Video or Image */}
                {slide.type === "video" ? (
                  <video
                    src={slide.videoSource}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{
                      transform: `translate(${parallaxStyle.x}px, ${parallaxStyle.y}px) scale(1.15)`,
                      transition: "transform 0.3s ease-out",
                    }}
                  />
                ) : slide.type === "icon" ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-8 text-[#E85D04]">
                    <motion.img
                      src={slide.image}
                      alt={slide.title}
                      className="w-1/2 h-1/2 object-contain drop-shadow-2xl opacity-50 contrast-125 saturate-200"
                      style={{
                        transform: `translate(${parallaxStyle.x}px, ${parallaxStyle.y}px) scale(1.08)`,
                        transition: "transform 0.3s ease-out",
                      }}
                    />
                  </div>
                ) : (
                  <motion.img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    style={{
                      transform: `translate(${parallaxStyle.x}px, ${parallaxStyle.y}px) scale(1.08)`,
                      transition: "transform 0.3s ease-out",
                    }}
                  />
                )}

                {/* Dark Overlay to make text readable */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />

                <div className="absolute inset-0 flex items-center px-8 md:px-16">
                  <div className="max-w-xl text-white">
                    {idx === selectedIndex && (
                      <>
                        <motion.h2
                          key={`title-${selectedIndex}`}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                          variants={heroTextVariants}
                          className="text-3xl md:text-6xl font-display font-bold mb-4 leading-tight uppercase drop-shadow-lg"
                        >
                          {slide.title}
                        </motion.h2>
                        <motion.p
                          key={`sub-${selectedIndex}`}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                          variants={heroTextVariants}
                          className="text-lg md:text-xl mb-8 text-white/80 font-light"
                        >
                          {slide.subtitle}
                        </motion.p>
                        <motion.div
                          key={`cta-${selectedIndex}`}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                          variants={heroTextVariants}
                        >
                          <Link to={`/collection?category=${encodeURIComponent(slide.category)}`}>
                            <button className="btn-primary btn-shimmer text-lg">
                              <span className="relative z-10">{slide.cta}</span>
                            </button>
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass text-white flex items-center justify-center hover:bg-white/30 hover:scale-110 active:scale-95 z-20 transition-all duration-300"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass text-white flex items-center justify-center hover:bg-white/30 hover:scale-110 active:scale-95 z-20 transition-all duration-300"
      >
        <ChevronRight size={22} />
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${idx === selectedIndex
              ? "w-8 bg-brand-500 shadow-glow"
              : "w-2 bg-surface-300 hover:bg-surface-400"
              }`}
          />
        ))}
      </div>
    </section>
  );
}