import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import LoadingScreen from './components/LoadingScreen';
import HelpPrompt from './components/HelpPrompt';
import InterfaceUI from './components/InterfaceUI';
import eventBus from './EventBus';
import { PORTFOLIO_HTML } from '../World/MonitorScreen';
import './style.css';

// ── Main app ─────────────────────────────────────────────────────────────────
const App = () => {
    const [loading,   setLoading]   = useState(true);
    const [flatMode,  setFlatMode]  = useState(false);
    const [inMonitor, setInMonitor] = useState(false);

    useEffect(() => {
        eventBus.on('loadingScreenDone', () => setLoading(false));
        eventBus.on('enterMonitor', () => {
            setInMonitor(true);
            document.body.classList.add('in-monitor');
        });
        eventBus.on('leftMonitor',  () => {
            setInMonitor(false);
            document.body.classList.remove('in-monitor');
        });
    }, []);

    // Inject portfolio HTML into the flat iframe on first switch
    const toggleFlat = useCallback(() => {
        setFlatMode(prev => {
            const next = !prev;
            document.body.classList.toggle('flat', next);
            if (next) {
                const iframe = document.getElementById('flat-site') as HTMLIFrameElement | null;
                if (iframe && !iframe.srcdoc) {
                    iframe.srcdoc = PORTFOLIO_HTML;
                }
            }
            return next;
        });
    }, []);

    const exitMonitor = useCallback(() => {
        document.body.classList.remove('in-monitor');
        eventBus.dispatch('leftMonitor', {});
    }, []);

    return (
        <div id="ui-app">
            {!loading && !inMonitor && <HelpPrompt />}
            <LoadingScreen />

            {/* Exit screen button when zoomed into monitor */}
            {!loading && inMonitor && !flatMode && (
                <button
                    onClick={exitMonitor}
                    style={exitBtnStyle}
                    className="mode-btn"
                    id="prevent-click"
                    title="Zoom out back to desk (Esc)"
                >
                    ⤺  Zoom Out (Esc)
                </button>
            )}

            {/* Flat / 3D toggle — bottom-right corner */}
            {!loading && (
                <button
                    onClick={toggleFlat}
                    style={modeStyle}
                    className="mode-btn"
                    id="prevent-click"
                >
                    {flatMode ? '⬡  3D Desk' : '⬡  Flat Site'}
                </button>
            )}
        </div>
    );
};

const exitBtnStyle: React.CSSProperties = {
    position: 'fixed',
    top: 14,
    right: 20,
    zIndex: 999,
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#00f5ff',
    background: 'rgba(2,8,16,0.85)',
    border: '1px solid rgba(0,245,255,0.45)',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 0 16px rgba(0,245,255,0.25)',
    transition: 'all 0.2s',
};

const modeStyle: React.CSSProperties = {
    position: 'fixed',
    right: 20,
    bottom: 20,
    zIndex: 4,
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#00f5ff',
    background: 'rgba(2,8,16,0.75)',
    border: '1px solid rgba(0,245,255,0.35)',
    borderRadius: 6,
    padding: '7px 14px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
};

const createUI = () => {
    ReactDOM.render(<App />, document.getElementById('ui'));
};

const createVolumeUI = () => {
    ReactDOM.render(<InterfaceUI />, document.getElementById('ui-interactive'));
};

export { createUI, createVolumeUI };
