import React from "react";
import "./WishMeter.css";
import wishMeterData from "../data/wishMeter.json";

export default function WishMeter({ caughtStars, currentLanguage }) {
  const langData = wishMeterData[currentLanguage] || wishMeterData.en;
  return (
    <div className="wish-meter">
      <img 
        src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text x='0' y='20' font-size='20'>${langData.star}</text></svg>`}
        alt="star" 
        className="wish-meter-star" />
      {langData.label}: {caughtStars}
    </div>
  );
}
