import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import InfoOverlay from './InfoOverlay';

interface InterfaceUIProps {}

const InterfaceUI: React.FC<InterfaceUIProps> = ({}) => {
    const [loading,  setLoading]  = useState(true);
    const [visible,  setVisible]  = useState(false);
    const interfaceRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        UIEventBus.on('loadingScreenDone', () => setLoading(false));

        const el = document.getElementById('ui-interactive');
        if (el) (interfaceRef as React.MutableRefObject<HTMLElement | null>).current = el;
    }, []);

    useEffect(() => {
        if (loading) return;

        // Show HUD on first interaction (click or scroll-to-desk)
        const show = () => setVisible(true);
        document.addEventListener('mousedown', show, { once: true });
        document.addEventListener('wheel',     show, { once: true, passive: true });

        // Hide while inside monitor, re-show when leaving
        UIEventBus.on('enterMonitor', () => {
            setVisible(false);
            if (interfaceRef.current) interfaceRef.current.style.pointerEvents = 'none';
        });
        UIEventBus.on('leftMonitor', () => {
            setVisible(true);
            if (interfaceRef.current) interfaceRef.current.style.pointerEvents = 'auto';
        });

        return () => {
            document.removeEventListener('mousedown', show);
            document.removeEventListener('wheel', show);
        };
    }, [loading]);

    return !loading ? (
        <motion.div
            initial="hide"
            variants={vars}
            animate={visible ? 'show' : 'hide'}
            style={styles.wrapper}
            className="interface-wrapper"
            id="prevent-click"
        >
            <InfoOverlay visible={visible} />
        </motion.div>
    ) : null;
};

const vars = {
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' },
    },
    hide: {
        x: -28,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
    },
};

interface StyleSheetCSS { [key: string]: React.CSSProperties; }

const styles: StyleSheetCSS = {
    wrapper: {
        width: '100%',
        display: 'flex',
        position: 'absolute',
        boxSizing: 'border-box',
    },
};

export default InterfaceUI;
