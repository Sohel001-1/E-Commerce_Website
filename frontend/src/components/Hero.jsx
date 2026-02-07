import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
// We are using Link from react-router-dom as it is standard for most apps
import { Link } from "react-router-dom"; 

const slides = [
  {
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000", // Placeholder: Replace with your actual oil/parts images
    title: "Top-Grade Motor Oil",
    subtitle: "Clean emissions with authentic lubricants",
    cta: "View Oils",
  },
  {
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000",
    title: "Genuine Engine Parts",
    subtitle: "OEM quality components for peak performance",
    cta: "Shop Engine Parts",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000",
    title: "Premium Brake Systems",
    subtitle: "Safety first with authentic components",
    cta: "Browse Brakes",
  }
];

export default function HeroSlider() {
  // align: "center" creates that "peek" effect you want
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false
  }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    /* w-screen + relative left-1/2... trick forces the slider to be 
       full-width even if the parent has a container/padding.
    */
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-4">
      <div className="overflow-visible" ref={emblaRef}>
        <div className="flex"> 
          {slides.map((slide, idx) => (
            <div 
              key={idx} 
              // flex-[0_0_85%] leaves 15% space to see the next/previous slides (the peek)
              className="flex-[0_0_85%] sm:flex-[0_0_90%] min-w-0 px-2 relative"
            >
              <div className="relative h-[400px] md:h-[550px] overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center px-8 md:px-16">
                  <div className="max-w-xl text-white">
                    <h2 className="text-3xl md:text-6xl font-bold mb-4 leading-tight uppercase">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-white/80">
                      {slide.subtitle}
                    </p>
                    <Link to="/shop">
                      {/* Using standard HTML button with Tailwind to replace the broken 'Button' component */}
                      <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-md transition-colors text-lg">
                        {slide.cta}
                      </button>
                    </Link>
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
        className="absolute left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === selectedIndex ? "w-8 bg-orange-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}