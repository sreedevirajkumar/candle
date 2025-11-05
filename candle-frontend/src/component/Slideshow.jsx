import React, { useState, useRef, useEffect } from "react";
import "./Slideshow.css";

const defaultSlides = [
  { image: "/images/rose.jpg", alt: "Rose Candle" },
  { image: "/images/lavender.jpg", alt: "Lavender Candle" },
  { image: "/images/vanilla.jpg", alt: "Vanilla Candle" },
];

export default function Slideshow({
  slides = defaultSlides,
  title = "Extraordinary candles made by master perfumers",
  subtitle = "Discover the everyday magic in and around us",
  ctaPrimaryText = "Shop Bestsellers",
  ctaPrimaryOnClick,
  ctaSecondaryText = "Contact Us",
  ctaSecondaryOnClick,
  intervalMs = 4000,
}) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = (index) => {
    setCurrent((index + slides.length) % slides.length);
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prevIdx) => (prevIdx + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [slides.length, intervalMs]);

  return (
    <div className="slideshow">
      <div className="slides-wrap">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`slide ${idx === current ? "active" : ""}`}
            aria-hidden={idx !== current}
          >
            <img src={s.image} alt={s.alt || "Slide image"} />
          </div>
        ))}
        <button className="nav prev" aria-label="Previous" onClick={prev}>
          ‹
        </button>
        <button className="nav next" aria-label="Next" onClick={next}>
          ›
        </button>
        <div className="indicators" role="tablist" aria-label="Slideshow indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === current}
              className={`dot ${idx === current ? "active" : ""}`}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      </div>
      <div className="overlay">
        <div className="overlay-inner">
          <h1 className="overlay-title">{title}</h1>
          <p className="overlay-subtitle">{subtitle}</p>
          <div className="overlay-actions">
            {ctaPrimaryText && (
              <button className="btn btn-primary" onClick={ctaPrimaryOnClick}>
                {ctaPrimaryText}
              </button>
            )}
            {ctaSecondaryText && (
              <button className="btn btn-outline" onClick={ctaSecondaryOnClick}>
                {ctaSecondaryText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



