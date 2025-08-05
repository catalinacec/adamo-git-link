import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LangToggle() {
  const [currentLang, setCurrentLang] = useState('es');

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    setCurrentLang(newLang);
    // Here you would implement the actual language switching logic
    // For now, we'll just update the state
  };

  return (
    <div className="text-center">
      <span className="text-white/70 text-sm">
        Switch to:{" "}
        <button 
          onClick={toggleLanguage}
          className="text-white hover:text-white/90 underline font-medium"
        >
          {currentLang === 'es' ? 'English' : 'Español'}
        </button>
      </span>
    </div>
  );
}