/**
 * @module TypographyConfig
 * @description Premium typography system for healthcare industry standards
 */

export const typographyConfig = {
  fonts: {
    // Primary font for headlines - Professional and modern
    headline: {
      family: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
    },
    // Secondary font for body text - Excellent readability
    body: {
      family: "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
      },
    },
    // Monospace font for data and code
    mono: {
      family: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace",
      weights: {
        regular: 400,
        medium: 500,
        bold: 700,
      },
    },
  },
  
  // Healthcare industry standard type scale
  scale: {
    // Display sizes for major headlines
    display: {
      xl: {
        fontSize: 'clamp(3rem, 8vw, 5rem)',
        lineHeight: '1.1',
        letterSpacing: '-0.02em',
        fontWeight: 800,
      },
      lg: {
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        lineHeight: '1.15',
        letterSpacing: '-0.02em',
        fontWeight: 700,
      },
      md: {
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        lineHeight: '1.2',
        letterSpacing: '-0.01em',
        fontWeight: 700,
      },
      sm: {
        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
        lineHeight: '1.25',
        letterSpacing: '-0.01em',
        fontWeight: 600,
      },
    },
    
    // Heading sizes for sections
    heading: {
      h1: {
        fontSize: 'clamp(2rem, 4vw, 2.5rem)',
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
        fontWeight: 700,
      },
      h2: {
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        lineHeight: '1.35',
        letterSpacing: '-0.005em',
        fontWeight: 600,
      },
      h3: {
        fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
        lineHeight: '1.4',
        letterSpacing: '0',
        fontWeight: 600,
      },
      h4: {
        fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
        lineHeight: '1.45',
        letterSpacing: '0',
        fontWeight: 500,
      },
    },
    
    // Body text sizes
    body: {
      xl: {
        fontSize: '1.25rem',
        lineHeight: '1.75',
        letterSpacing: '0',
        fontWeight: 400,
      },
      lg: {
        fontSize: '1.125rem',
        lineHeight: '1.75',
        letterSpacing: '0',
        fontWeight: 400,
      },
      base: {
        fontSize: '1rem',
        lineHeight: '1.75',
        letterSpacing: '0',
        fontWeight: 400,
      },
      sm: {
        fontSize: '0.875rem',
        lineHeight: '1.5',
        letterSpacing: '0',
        fontWeight: 400,
      },
      xs: {
        fontSize: '0.75rem',
        lineHeight: '1.5',
        letterSpacing: '0.01em',
        fontWeight: 400,
      },
    },
    
    // Special purpose text
    special: {
      quote: {
        fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
        lineHeight: '1.6',
        letterSpacing: '0',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: '1.4',
        letterSpacing: '0.02em',
        fontWeight: 500,
        textTransform: 'uppercase' as const,
      },
      overline: {
        fontSize: '0.75rem',
        lineHeight: '1.2',
        letterSpacing: '0.08em',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
      },
      label: {
        fontSize: '0.875rem',
        lineHeight: '1.4',
        letterSpacing: '0.01em',
        fontWeight: 500,
      },
    },
  },
  
  // Healthcare industry color palette for text
  colors: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Animation presets for text
  animations: {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    typewriter: {
      initial: { width: 0 },
      animate: { width: '100%' },
      transition: { duration: 2, ease: 'linear' },
    },
  },
};

// CSS-in-JS styles for Next.js
export const typographyStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

  /* Font smoothing for better rendering */
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Headline styles */
  .headline-display-xl {
    font-family: ${typographyConfig.fonts.headline.family};
    font-size: ${typographyConfig.scale.display.xl.fontSize};
    line-height: ${typographyConfig.scale.display.xl.lineHeight};
    letter-spacing: ${typographyConfig.scale.display.xl.letterSpacing};
    font-weight: ${typographyConfig.scale.display.xl.fontWeight};
  }

  .headline-display-lg {
    font-family: ${typographyConfig.fonts.headline.family};
    font-size: ${typographyConfig.scale.display.lg.fontSize};
    line-height: ${typographyConfig.scale.display.lg.lineHeight};
    letter-spacing: ${typographyConfig.scale.display.lg.letterSpacing};
    font-weight: ${typographyConfig.scale.display.lg.fontWeight};
  }

  /* Body text styles */
  .body-text-lg {
    font-family: ${typographyConfig.fonts.body.family};
    font-size: ${typographyConfig.scale.body.lg.fontSize};
    line-height: ${typographyConfig.scale.body.lg.lineHeight};
    letter-spacing: ${typographyConfig.scale.body.lg.letterSpacing};
    font-weight: ${typographyConfig.scale.body.lg.fontWeight};
  }

  .body-text-base {
    font-family: ${typographyConfig.fonts.body.family};
    font-size: ${typographyConfig.scale.body.base.fontSize};
    line-height: ${typographyConfig.scale.body.base.lineHeight};
    letter-spacing: ${typographyConfig.scale.body.base.letterSpacing};
    font-weight: ${typographyConfig.scale.body.base.fontWeight};
  }

  /* Healthcare industry specific text treatments */
  .healthcare-metric {
    font-family: ${typographyConfig.fonts.mono.family};
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }

  .healthcare-label {
    font-family: ${typographyConfig.fonts.body.family};
    font-size: ${typographyConfig.scale.special.label.fontSize};
    line-height: ${typographyConfig.scale.special.label.lineHeight};
    letter-spacing: ${typographyConfig.scale.special.label.letterSpacing};
    font-weight: ${typographyConfig.scale.special.label.fontWeight};
  }

  /* Gradient text effect */
  .gradient-text {
    background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Text shadow for depth */
  .text-shadow-healthcare {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  /* Responsive typography utilities */
  @media (max-width: 768px) {
    .headline-display-xl {
      font-size: 3rem;
    }
    .headline-display-lg {
      font-size: 2.5rem;
    }
  }
`;

export default typographyConfig;