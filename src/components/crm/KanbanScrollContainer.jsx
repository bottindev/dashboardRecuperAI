import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_AMOUNT = 320; // ~1 column width

/**
 * Horizontal scroll wrapper with shadow gradients and arrow navigation.
 * @param {{ children: React.ReactNode }} props
 */
export function KanbanScrollContainer({ children }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  // Re-check when children change (e.g., filter applied)
  useEffect(() => {
    checkScroll();
  }, [children, checkScroll]);

  function scrollBy(direction) {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_AMOUNT,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative h-full">
      {/* Left arrow + gradient */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-0 z-10 flex h-full w-10 items-center justify-start bg-gradient-to-r from-background to-transparent pl-1"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>
      )}

      {/* Right arrow + gradient */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-0 z-10 flex h-full w-10 items-center justify-end bg-gradient-to-l from-background to-transparent pr-1"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>
      )}

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className="flex h-full w-full gap-4 overflow-x-auto pb-4 pt-2 scroll-smooth"
      >
        {children}
      </div>
    </div>
  );
}
