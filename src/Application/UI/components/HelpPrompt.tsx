import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';

const HELP_TEXT = 'Scroll or click monitor to zoom • Click 3D Robot to interact';

type HelpPromptProps = {};

const HelpPrompt: React.FC<HelpPromptProps> = () => {
    const [helpText, setHelpText] = useState('');
    const [visible, setVisible] = useState(true);
    const visRef = useRef(visible);
    const [pulse, setPulse] = useState(false);

    const typeHelpText = (i: number, curText: string) => {
        if (i < HELP_TEXT.length && visRef.current) {
            setTimeout(() => {
                window.postMessage(
                    { type: 'keydown', key: `_AUTO_${HELP_TEXT[i]}` },
                    '*'
                );
                setHelpText(curText + HELP_TEXT[i]);
                typeHelpText(i + 1, curText + HELP_TEXT[i]);
            }, Math.random() * 100 + 45);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            typeHelpText(0, '');
        }, 500);

        document.addEventListener('mousedown', () => {
            setVisible(false);
        });
        UIEventBus.on('enterMonitor', () => {
            setVisible(false);
        });

        // Pulse glow
        const pulseInterval = setInterval(() => {
            setPulse(p => !p);
        }, 1800);
        return () => clearInterval(pulseInterval);
    }, []);

    useEffect(() => {
        if (visible === false) {
            window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
        }
        visRef.current = visible;
    }, [visible]);

    return helpText.length > 0 ? (
        <motion.div
            variants={vars}
            animate={visible ? 'visible' : 'hide'}
            style={Object.assign({}, styles.container, {
                boxShadow: pulse
                    ? '0 0 24px rgba(0,245,255,0.35), 0 0 48px rgba(0,245,255,0.12), inset 0 0 16px rgba(0,245,255,0.06)'
                    : '0 0 12px rgba(0,245,255,0.18), 0 0 24px rgba(0,245,255,0.06)',
            })}
            className="help-prompt-glass"
        >
            {/* Left accent dot */}
            <div style={styles.accentDot} />
            <p style={styles.helpText}>{helpText}</p>
            <div style={styles.blinkingContainer}>
                <div className="blinking-cursor" />
            </div>
        </motion.div>
    ) : (
        <></>
    );
};

const vars = {
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.05, 0.7, 0.1, 1],
        },
    },
    hide: {
        y: 16,
        opacity: 0,
        transition: {
            duration: 0.4,
            ease: [0.9, 0.05, 0.1, 1],
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        position: 'absolute',
        bottom: 64,
        background: 'rgba(2, 8, 16, 0.80)',
        border: '1px solid rgba(0, 245, 255, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'box-shadow 0.9s ease',
        pointerEvents: 'none',
    },
    accentDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#00f5ff',
        boxShadow: '0 0 8px #00f5ff, 0 0 16px rgba(0,245,255,0.5)',
        flexShrink: 0,
    },
    helpText: {
        fontSize: 13,
        color: '#c8d6e5',
        fontFamily: 'monospace',
        letterSpacing: 2,
        textTransform: 'uppercase',
    } as React.CSSProperties,
    blinkingContainer: {
        marginLeft: 2,
        paddingBottom: 1,
    },
};

export default HelpPrompt;
