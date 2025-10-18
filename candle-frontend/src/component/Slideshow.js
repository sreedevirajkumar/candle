import React, { useState, useEffect } from "react";
import "./Slideshow.css";

const slides = [
  { image: "/images/rose.jpg", title: "Rose Candle" },
  { image: "/images/lavender.jpg", title: "Lavender Light" },
  { image: "/images/vanilla.jpg", title: "Vanilla Bliss" },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow">
      <img src={slides[current].image} alt={slides[current].title} />
      <h2>{slides[current].title}</h2>
    </div>
  );
}