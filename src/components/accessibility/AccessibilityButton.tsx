import React, { useState, useEffect } from 'react';
import { Accessibility, X, Type, Contrast, Space, Underline } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react'; // O 'framer-motion'

// Paleta de colores sincronizada con el Login
const colors = {
  primaryBlue: '#1047A9', 
  surfaceWhite: '#FFFFFF', 
  textDark: '#1A1A1A',     
  textMuted: '#8DAAC8',   
  inputBorder: '#E1E1E1',  
  activeBg: '#F0F4FA',     // Un azul muy claro para los estados activos/seleccionados
  inactiveBg: '#D1D5DB'    // Gris para los switches apagados
};

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
      {/* BOTÓN FLOTANTE PRINCIPAL */}
      <button
        onClick={() => onToggle ? onToggle() : null}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110 active:scale-95 z-50"
        style={{ backgroundColor: colors.primaryBlue }} // Azul cobalto
        aria-label="Abrir panel de accesibilidad"
      >
        <Accessibility size={28} />
      </button>

      {/* PANEL DESPLEGABLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 rounded-2xl p-6 shadow-2xl z-50 border border-blue-50"
            style={{ backgroundColor: colors.surfaceWhite }} // Fondo blanco puro
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: colors.textDark }}>Accesibilidad</h3>
              <button 
                onClick={onToggle} 
                className="transition-colors hover:text-red-500"
                style={{ color: colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* TAMAÑO DE TEXTO */}
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: colors.textMuted }}>
                  <Type size={16} /> Tamaño de texto
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['small', 'normal', 'large', 'huge'].map((size) => {
                    const isActive = settings.fontSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className="rounded-lg border py-2 text-xs font-medium transition-colors"
                        style={{
                          borderColor: isActive ? colors.primaryBlue : colors.inputBorder,
                          backgroundColor: isActive ? colors.primaryBlue : 'transparent',
                          color: isActive ? colors.surfaceWhite : colors.textDark,
                        }}
                      >
                        {size === 'small' ? 'P' : size === 'normal' ? 'N' : size === 'large' ? 'G' : 'MG'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SWITCHES (CONTRASTE, ESPACIADO, SUBRAYADO) */}
              <div className="space-y-3">
                {[
                  { key: 'highContrast', icon: <Contrast size={18} />, label: 'Alto contraste' },
                  { key: 'letterSpacing', icon: <Space size={18} />, label: 'Espaciado de texto' },
                  { key: 'underlineLinks', icon: <Underline size={18} />, label: 'Subrayar enlaces' },
                ].map(({ key, icon, label }) => {
                  const isActive = settings[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleSetting(key)}
                      className="flex w-full items-center justify-between rounded-xl border p-3 transition-colors"
                      style={{
                        borderColor: isActive ? colors.primaryBlue : colors.inputBorder,
                        backgroundColor: isActive ? colors.activeBg : 'transparent',
                        color: colors.textDark
                      }}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        {icon} {label}
                      </span>
                      {/* Switch visual */}
                      <div 
                        className="h-5 w-10 rounded-full p-1 transition-colors"
                        style={{ backgroundColor: isActive ? colors.primaryBlue : colors.inactiveBg }}
                      >
                        <div 
                          className={`h-3 w-3 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} 
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityButton;