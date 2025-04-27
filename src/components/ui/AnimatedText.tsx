'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  effect?: 'type' | 'fade' | 'highlight' | 'bounce' | 'wave';
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  color?: string;
  highlightColor?: string;
  once?: boolean;
  loop?: boolean;
  repeatDelay?: number;
  typeSpeed?: number;
  delayPerWord?: number;
}

export function AnimatedText({
  text,
  className,
  effect = 'fade',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.03,
  color = 'currentColor',
  highlightColor = 'rgba(255, 233, 148, 0.6)', // Default highlight color
  once = true,
  loop = false,
  repeatDelay = 5,
  typeSpeed = 0.05, // in seconds per character
  delayPerWord = 0.1, // extra delay between words for type effect
}: AnimatedTextProps) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Split text into words and then characters
  const words = text.split(' ');
  
  // For typing effect
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);

  // Character variants for different effects
  const getCharacterVariants = (): Variants => {
    switch (effect) {
      case 'fade':
        return {
          hidden: { opacity: 0, y: 10 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + (i * staggerChildren),
              duration,
              ease: [0.2, 0.65, 0.3, 0.9],
            },
          }),
        };
      case 'highlight':
        return {
          hidden: { opacity: 0, backgroundSize: '0% 100%' },
          visible: (i) => ({
            opacity: 1,
            backgroundSize: '100% 100%',
            transition: {
              opacity: { duration: duration * 0.5, delay: delay + (i * staggerChildren) },
              backgroundSize: { 
                duration: duration * 0.7, 
                delay: delay + (i * staggerChildren) + (duration * 0.3),
                ease: [0.25, 0.46, 0.45, 0.94],
              }
            },
          }),
        };
      case 'bounce':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: delay + (i * staggerChildren),
              duration: duration * 0.8,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            },
          }),
        };
      case 'wave':
        return {
          hidden: { opacity: 0, y: 0 },
          visible: (i) => ({
            opacity: 1,
            y: [0, -15, 0],
            transition: {
              delay: delay + (i * staggerChildren),
              duration: duration * 1.2,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            },
          }),
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: (i) => ({
            opacity: 1,
            transition: { 
              delay: delay + (i * staggerChildren),
              duration 
            },
          }),
        };
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, inView, once]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Typing effect logic
  useEffect(() => {
    if (effect !== 'type' || !inView) return;
    
    let currentText = '';
    let charIndex = 0;
    let wordIndex = 0;
    const allText = text;
    setDisplayedText('');
    setIsTypingComplete(false);

    const typeNextChar = () => {
      if (charIndex < allText.length) {
        currentText += allText[charIndex];
        setDisplayedText(currentText);
        charIndex++;
        
        // Add extra delay when we encounter a space (word boundary)
        const nextDelay = allText[charIndex - 1] === ' ' ? 
          typeSpeed * 1000 + (delayPerWord * 1000) : 
          typeSpeed * 1000;
        
        setTimeout(typeNextChar, nextDelay);
      } else {
        setIsTypingComplete(true);
        if (loop) {
          setTimeout(() => {
            setCurrentLoop(prev => prev + 1);
            setDisplayedText('');
            charIndex = 0;
            currentText = '';
            setTimeout(typeNextChar, 300); // Small delay before restarting
          }, repeatDelay * 1000);
        }
      }
    };
    
    // Start typing with initial delay
    const timeout = setTimeout(typeNextChar, delay * 1000);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [effect, inView, text, typeSpeed, delay, delayPerWord, loop, repeatDelay, currentLoop]);

  // Handle different animation effects
  if (effect === 'type') {
    return (
      <div 
        ref={containerRef} 
        className={cn('', className)}
        style={{ color }}
      >
        {displayedText}
        {/* Optional blinking cursor */}
        {!isTypingComplete && (
          <span className="inline-block w-[0.1em] h-[1.2em] ml-1 align-middle bg-current animate-blink" />
        )}
      </div>
    );
  }

  // For other animation effects
  const characterVariants = getCharacterVariants();

  return (
    <motion.div
      ref={containerRef}
      className={cn('', className)}
      initial="hidden"
      animate={controls}
      style={{ color }}
    >
      {words.map((word, wordIndex) => (
        <React.Fragment key={`word-${wordIndex}`}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span
                key={`char-${wordIndex}-${charIndex}`}
                custom={wordIndex + (charIndex * 0.1)}
                variants={characterVariants}
                className={cn(
                  'inline-block',
                  effect === 'highlight' && 'bg-gradient-to-r from-transparent to-transparent bg-no-repeat',
                )}
                style={
                  effect === 'highlight' 
                    ? { 
                        backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
                        backgroundPosition: '0 85%',
                        backgroundSize: '0% 100%',
                      } 
                    : {}
                }
              >
                {char}
              </motion.span>
            ))}
          </span>
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </motion.div>
  );
}

// Preset variations
export function TypeWriter(props: Omit<AnimatedTextProps, 'effect'>) {
  return <AnimatedText effect="type" {...props} />;
}

export function HighlightText(props: Omit<AnimatedTextProps, 'effect'>) {
  return <AnimatedText effect="highlight" {...props} />;
}

export function BounceText(props: Omit<AnimatedTextProps, 'effect'>) {
  return <AnimatedText effect="bounce" {...props} />;
}

export function WaveText(props: Omit<AnimatedTextProps, 'effect'>) {
  return <AnimatedText effect="wave" {...props} />;
} 