import React, { useState, useEffect } from 'react';
import { Accessibility, X, Type, Contrast, Space, Underline } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AccessibilityButton = ({ isOpen, onToggle }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('kurao_accessibility');
    return saved ? JSON.parse(saved) : {
      fontSize: 'normal',
      highContrast: false,
      letterSpacing: false,
      underlineLinks: false
    };
  });

  useEffect(() => {
    localStorage.setItem('kurao_accessibility', JSON.stringify(settings));
    
    // Apply settings
    const html = document.documentElement;
    const body = document.body;

    // Font size
    const fontSizes = {
      small: '14px',
      normal: '16px',
      large: '18px',
      huge: '20px'
    };
    html.style.fontSize = fontSizes[settings.fontSize];

    // High contrast
    if (settings.highContrast) body.classList.add('high-contrast');
    else body.classList.remove('high-contrast');

    // Letter spacing
    if (settings.letterSpacing) body.classList.add('letter-spacing');
    else body.classList.remove('letter-spacing');

    // Underline links
    if (settings.underlineLinks) body.classList.add('underline-links');
    else body.classList.remove('underline-links');

  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setFontSize = (size) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  return (
    <>
      <button
        onClick={() => onToggle ? onToggle() : null}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)] text-white shadow-lg transition-transform hover:scale-110 active:scale-95 z-50"
        aria-label="Abrir panel de accesibilidad"
      >
        <Accessibility size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl z-50"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--color-text)]">Accesibilidad</h3>
              <button onClick={onToggle} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
                  <Type size={16} /> Tamaño de texto
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['small', 'normal', 'large', 'huge'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                        settings.fontSize === size
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {size === 'small' ? 'Pequeño' : size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Muy G.'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => toggleSetting('highContrast')}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 transition-colors ${
                    settings.highContrast ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)]'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Contrast size={18} /> Alto contraste
                  </span>
                  <div className={`h-5 w-10 rounded-full p-1 transition-colors ${settings.highContrast ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
                    <div className={`h-3 w-3 rounded-full bg-white transition-transform ${settings.highContrast ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>

                <button
                  onClick={() => toggleSetting('letterSpacing')}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 transition-colors ${
                    settings.letterSpacing ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)]'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Space size={18} /> Espaciado de texto
                  </span>
                  <div className={`h-5 w-10 rounded-full p-1 transition-colors ${settings.letterSpacing ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
                    <div className={`h-3 w-3 rounded-full bg-white transition-transform ${settings.letterSpacing ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>

                <button
                  onClick={() => toggleSetting('underlineLinks')}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 transition-colors ${
                    settings.underlineLinks ? 'border-[var(--color-primary)] bg-blue-50' : 'border-[var(--color-border)]'
                  }`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <Underline size={18} /> Subrayar enlaces
                  </span>
                  <div className={`h-5 w-10 rounded-full p-1 transition-colors ${settings.underlineLinks ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
                    <div className={`h-3 w-3 rounded-full bg-white transition-transform ${settings.underlineLinks ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityButton;
