import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente de animación simplificada para el Mundial.
 * Solo muestra el efecto de "¡GOOOL!" y confeti al interactuar.
 */
const GoalClickEffect = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const handleGoal = (e) => {
      const { x, y } = e.detail || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const id = Date.now();
      
      setGoals((prev) => [...prev, { id, x, y }]);
      
      // Limpiar el efecto después de 2.5 segundos
      setTimeout(() => {
        setGoals((prev) => prev.filter(g => g.id !== id));
      }, 2500);
    };

    window.addEventListener('soccer-goal', handleGoal);
    return () => window.removeEventListener('soccer-goal', handleGoal);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {goals.map((goal) => (
          <React.Fragment key={goal.id}>
            
            {/* Celebración de Confeti y Texto */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
                <div className="relative">
                    {/* Texto ¡GOOOL! con animación de pulso y rotación */}
                    <motion.div 
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          rotate: [-5, 5, -5, 5, 0],
                          y: [0, -20, 0]
                        }}
                        transition={{ duration: 0.6, times: [0, 0.2, 0.5, 0.8, 1] }}
                        className="text-7xl md:text-9xl font-black text-blue-700 italic drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)] z-20 font-brand"
                        style={{ WebkitTextStroke: '3px white' }}
                    >
                        ¡GOOOOL!
                    </motion.div>
                    
                    {/* Lluvia de Confeti (Círculos y Rectángulos) */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{ 
                                x: (Math.random() - 0.5) * 1000, 
                                y: (Math.random() - 0.5) * 1000, 
                                opacity: 0,
                                rotate: Math.random() * 720,
                                scale: 0.5
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`absolute w-3 h-3 md:w-5 md:h-5 ${i % 2 === 0 ? 'rounded-full' : 'rounded-sm'} ${
                              ['bg-yellow-400', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-white'][i % 5]
                            }`}
                        />
                    ))}
                </div>
            </motion.div>

          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GoalClickEffect;
