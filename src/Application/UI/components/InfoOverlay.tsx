/**
 * InfoOverlay.tsx — Anjali Tripathi Portfolio
 *
 * Left-side HUD shows ONLY:
 *   • Name  (typewriter)
 *   • "Available for Hire" status dot
 *   • Title  (typewriter)
 *   • Live clock
 *   • Stack one-liner
 *   • Mute + FreeCam controls
 *
 * Everything else (experience, projects, achievements, contact)
 * lives inside the PC monitor screen.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import FreeCamToggle from './FreeCamToggle';
import MuteToggle from './MuteToggle';

interface InfoOverlayProps { visible: boolean; }

const NAME  = 'Anjali Tripathi';
const TITLE = 'Full Stack  ·  AI/ML  ·  3D Web';
const STACK = 'MERN · Next.js · REST APIs · MongoDB · AI/ML';

const slide = (delay = 0) => ({
    initial:    { opacity: 0, x: -18 },
    animate:    { opacity: 1, x: 0   },
    transition: { duration: 0.45, delay, ease: [0.05, 0.7, 0.1, 1] as any },
});

const InfoOverlay: React.FC<InfoOverlayProps> = ({ visible }) => {
    const visRef = useRef(visible);

    const [nameText,  setNameText]  = useState('');
    const [titleText, setTitleText] = useState('');
    const [time,      setTime]      = useState(new Date().toLocaleTimeString());
    const timeRef = useRef(time);
    const [timeText,  setTimeText]  = useState('');
    const [done,      setDone]      = useState(false);
    const [ctrlOn,    setCtrlOn]    = useState(false);

    // ── Typewriter ───────────────────────────────────────────────────────
    const type = (
        i: number, cur: string, text: string,
        set: React.Dispatch<React.SetStateAction<string>>,
        cb: () => void,
        ref?: React.MutableRefObject<string>
    ) => {
        const src = ref ? ref.current : text;
        if (i < src.length) {
            setTimeout(() => {
                if (visRef.current)
                    window.postMessage({ type: 'keydown', key: `_AUTO_${src[i]}` }, '*');
                set(cur + src[i]);
                type(i + 1, cur + src[i], text, set, cb, ref);
            }, Math.random() * 50 + 45);
        } else cb();
    };

    useEffect(() => {
        if (visible && nameText === '') {
            setTimeout(() =>
                type(0, '', NAME, setNameText, () =>
                    type(0, '', TITLE, setTitleText, () =>
                        type(0, '', time, setTimeText, () => setDone(true), timeRef)))
            , 400);
        }
        visRef.current = visible;
    }, [visible]);

    useEffect(() => { if (done) setTimeout(() => setCtrlOn(true), 300); }, [done]);
    useEffect(() => { window.postMessage({ type: 'keydown', key: '_AUTO_' }, '*'); }, [ctrlOn]);

    // Live clock
    useEffect(() => {
        const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        timeRef.current = time;
        if (done) setTimeText(time);
    }, [time]);

    return (
        <div style={S.wrapper}>

            {/* ── Name ─────────────────────────────────────── */}
            {nameText !== '' && (
                <motion.div {...slide(0)} style={S.nameCard} className="hud-glass hud-name-card">
                    <div style={S.bar} />
                    <div style={S.nameInner}>
                        <p style={S.nameText}>{nameText}</p>
                        <div style={S.statusRow}>
                            <div className="status-dot" />
                            <span style={S.statusText}>Available for Hire</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Title ────────────────────────────────────── */}
            {titleText !== '' && (
                <motion.div {...slide(0.05)} style={S.pill} className="hud-glass">
                    <p style={S.titleText}>{titleText}</p>
                </motion.div>
            )}

            {/* ── Clock + controls ─────────────────────────── */}
            {timeText !== '' && (
                <motion.div {...slide(0.1)} style={S.row}>
                    <div style={S.clockPill} className="hud-glass">
                        <span style={S.clockIcon}>◷</span>
                        <p style={S.clockText}>{timeText}</p>
                    </div>
                    {ctrlOn && <><MuteToggle /><FreeCamToggle /></>}
                </motion.div>
            )}

            {/* ── Stack one-liner ───────────────────────────── */}
            {done && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.05, 0.7, 0.1, 1] }}
                    style={S.pill}
                    className="hud-glass"
                >
                    <p style={S.stackLabel}>STACK</p>
                    <p style={S.stackText}>{STACK}</p>
                </motion.div>
            )}

            {/* ── Hover hint ───────────────────────────────── */}
            {done && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={S.hint}
                >
                    <p style={S.hintText}>↗  Hover the screen for full portfolio</p>
                </motion.div>
            )}
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const S: StyleSheetCSS = {
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        maxWidth: 310,
    },

    // Name card
    nameCard: {
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', overflow: 'hidden',
    },
    bar: {
        width: 3, minHeight: 46, height: '100%',
        background: 'linear-gradient(180deg,#00f5ff,#bf00ff)',
        marginRight: 12, borderRadius: 2, flexShrink: 0,
    },
    nameInner: {
        display: 'flex', flexDirection: 'column',
        paddingRight: 16, paddingTop: 8, paddingBottom: 8,
    },
    nameText: {
        fontSize: 20, fontWeight: 700, letterSpacing: 2.5,
        color: '#fff', textShadow: '0 0 18px rgba(0,245,255,.9)',
        fontFamily: 'monospace', textTransform: 'uppercase', lineHeight: 1.2,
    } as React.CSSProperties,
    statusRow: {
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', marginTop: 4,
    },
    statusText: {
        fontSize: 9, color: '#00ff88', letterSpacing: 1.5,
        fontFamily: 'monospace', textTransform: 'uppercase', marginLeft: 5,
    },

    // Generic pill card
    pill: { padding: '5px 14px' },

    // Title
    titleText: {
        fontSize: 10, color: '#a0c4ff', letterSpacing: 2,
        fontFamily: 'monospace', textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(160,196,255,.4)',
    } as React.CSSProperties,

    // Clock row
    row: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 },
    clockPill: { display: 'flex', alignItems: 'center', padding: '4px 12px' },
    clockIcon: { color: '#00f5ff', fontSize: 12, marginRight: 6 },
    clockText: { fontSize: 11, color: '#e0e0e0', fontFamily: 'monospace', letterSpacing: 1 },

    // Stack
    stackLabel: {
        fontSize: 8, color: '#00f5ff', letterSpacing: 3,
        fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 3,
    } as React.CSSProperties,
    stackText: {
        fontSize: 11, color: '#c8d6e5',
        fontFamily: 'monospace', letterSpacing: 0.5, lineHeight: 1.5,
    },

    // Hint
    hint: { paddingLeft: 2, marginTop: 2 },
    hintText: {
        fontSize: 9, color: 'rgba(0,245,255,.45)',
        fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase',
    } as React.CSSProperties,
};

export default InfoOverlay;
