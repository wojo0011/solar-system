import React from "react";
import startExploringDataRaw from "../data/startExploring.json";
import languages from "../data/languages.json";
import ReactCountryFlag from "react-country-flag";
import "./LanguageSwitcher.css";

const FLAG_CODES = {
  en: "GB",
  fr: "FR",
  pl: "PL",
  ceb: "PH"
};

export default function LanguageSwitcher({ currentLanguage, setCurrentLanguage }) {
  const languageCodes = startExploringDataRaw.languages || ["en"];
  const localizedLabels = (languages[currentLanguage] && languages[currentLanguage].languages) || {};
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleSelect = (lang) => {
    setCurrentLanguage(lang);
    setModalOpen(false);
  };

  return (
    <div className="language-switcher-modal-wrapper">
      <button
        className="language-switcher-btn main"
        onClick={() => setModalOpen(true)}
        aria-label="Change language"
      >
        <ReactCountryFlag countryCode={FLAG_CODES[currentLanguage] || "UN"} svg style={{ fontSize: "1.3em", marginRight: "0.3em" }} />
        {localizedLabels[currentLanguage] || currentLanguage.toUpperCase()}
      </button>
      {modalOpen && (
        <div className="language-switcher-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="language-switcher-modal" onClick={e => e.stopPropagation()}>
            <h2 className="language-switcher-modal-title">{languages[currentLanguage]?.select || "Select Language"}</h2>
            <ul className="language-switcher-list">
              {languageCodes.map((lang) => (
                <li key={lang}>
                  <button
                    className={
                      "language-switcher-btn list" + (currentLanguage === lang ? " selected" : "")
                    }
                    onClick={() => handleSelect(lang)}
                    aria-pressed={currentLanguage === lang}
                  >
                    <span className="language-switcher-flag">
                      <ReactCountryFlag countryCode={FLAG_CODES[lang] || "UN"} svg style={{ fontSize: "1.3em", marginRight: "0.3em" }} />
                    </span>
                    <span className="language-switcher-label">{localizedLabels[lang] || lang.toUpperCase()}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="language-switcher-modal-close" onClick={() => setModalOpen(false)} aria-label="Close language selector">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
