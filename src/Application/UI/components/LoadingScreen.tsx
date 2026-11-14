import React, { useCallback, useEffect, useState } from 'react';
import eventBus from '../EventBus';

type LoadingProps = {};

const LoadingScreen: React.FC<LoadingProps> = () => {
    const [progress, setProgress] = useState(0);
    const [toLoad, setToLoad] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [loadingTextOpacity, setLoadingTextOpacity] = useState(1);
    const [startPopupOpacity, setStartPopupOpacity] = useState(0);
    const [webGLErrorOpacity, setWebGLErrorOpacity] = useState(0);

    const [showBiosInfo, setShowBiosInfo] = useState(false);
    const [showLoadingResources, setShowLoadingResources] = useState(false);
    const [doneLoading, setDoneLoading] = useState(false);
    const [webGLError, setWebGLError] = useState(false);
    const [counter, setCounter] = useState(0);
    const [resources] = useState<string[]>([]);
    const [mobileWarning, setMobileWarning] = useState(window.innerWidth < 768);
    const [scanlineOffset, setScanlineOffset] = useState(0);
    const [glitchActive, setGlitchActive] = useState(false);

    const onResize = () => {
        setMobileWarning(window.innerWidth < 768);
    };
    window.addEventListener('resize', onResize);

    // Scanline animation
    useEffect(() => {
        const id = setInterval(() => {
            setScanlineOffset(o => (o + 2) % 100);
        }, 30);
        return () => clearInterval(id);
    }, []);

    // Occasional glitch
    useEffect(() => {
        const glitch = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 120);
        }, 4500);
        return () => clearInterval(glitch);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            start();
        } else if (!detectWebGLContext()) {
            setWebGLError(true);
        } else {
            setShowBiosInfo(true);
        }
    }, []);

    useEffect(() => {
        eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
            setToLoad(data.toLoad);
            setLoaded(data.loaded);
            resources.push(
                `> ${data.sourceName}${getSpace(data.sourceName)}... ${Math.round(data.progress * 100)}%`
            );
            if (resources.length > 8) resources.shift();
        });
    }, []);

    useEffect(() => {
        setShowLoadingResources(true);
        setCounter(counter + 1);
    }, [loaded]);

    useEffect(() => {
        if (progress >= 1 && !webGLError) {
            setDoneLoading(true);
            setTimeout(() => {
                setLoadingTextOpacity(0);
                setTimeout(() => {
                    setStartPopupOpacity(1);
                }, 500);
            }, 1200);
        }
    }, [progress]);

    useEffect(() => {
        if (webGLError) {
            setTimeout(() => {
                setWebGLErrorOpacity(1);
            }, 500);
        }
    }, [webGLError]);

    const start = useCallback(() => {
        setLoadingOverlayOpacity(0);
        eventBus.dispatch('loadingScreenDone', {});
        const ui = document.getElementById('ui');
        if (ui) ui.style.pointerEvents = 'none';
    }, []);

    const getSpace = (sourceName: string) => {
        let spaces = '';
        for (let i = 0; i < 28 - sourceName.length; i++) spaces += '\xa0';
        return spaces;
    };

    const getCurrentDate = () => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const monthStr = month < 10 ? '0' + month : '' + month;
        const dayStr   = day   < 10 ? '0' + day   : '' + day;
        return `${monthStr}/${dayStr}/${year}`;
    };

    const detectWebGLContext = () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!(gl && gl instanceof WebGLRenderingContext);
    };

    const progressPercent = Math.round(progress * 100);
    const progressBarWidth = `${progressPercent}%`;

    return (
        <div
            style={Object.assign({}, styles.overlay, {
                opacity: overlayOpacity,
                transform: `scale(${overlayOpacity === 0 ? 1.08 : 1})`,
            })}
            className="bios-overlay"
        >
            {/* Scanline overlay */}
            <div
                style={Object.assign({}, styles.scanlines, {
                    backgroundPositionY: scanlineOffset + 'px',
                })}
            />

            {/* CRT vignette */}
            <div style={styles.vignette} />

            {startPopupOpacity === 0 && loadingTextOpacity === 0 && (
                <div style={styles.blinkingContainer}>
                    <span className="blinking-cursor" />
                </div>
            )}

            {!webGLError && (
                <div
                    style={Object.assign({}, styles.overlayText, {
                        opacity: loadingTextOpacity,
                        filter: glitchActive ? 'hue-rotate(90deg) brightness(1.4)' : 'none',
                        transform: glitchActive ? 'translateX(2px)' : 'none',
                    })}
                >
                    {/* Header */}
                    <div style={styles.header} className="loading-screen-header">
                        <div style={styles.logoContainer}>
                            <div>
                                <p style={styles.logoLine1}>ANJALI</p>
                                <p style={styles.logoLine2}>TRIPATHI.SYS</p>
                            </div>
                            <div style={styles.logoTagline}>
                                <p style={styles.taglineText}>[ PORTFOLIO v2.0 ]</p>
                            </div>
                        </div>
                        <div style={styles.headerInfo}>
                            <p style={styles.headerInfoText}>Build: 2026</p>
                            <p style={styles.headerInfoText}>AT-BIOS © 2024 Anjali Tripathi</p>
                            <p style={styles.headerInfoText}>Stack: MERN · Next.js · AI/ML</p>
                        </div>
                    </div>

                    <div style={styles.dividerLine} />

                    {/* Body */}
                    <div style={styles.body} className="loading-screen-body">
                        <p style={styles.sysText}>AT-Portfolio-OS v2.0 — Initializing runtime</p>
                        <div style={styles.spacer} />
                        {showBiosInfo && (
                            <>
                                <p style={styles.sysText}>Madhuben & Bhanubhai Patel Institute of Technology</p>
                                <p style={styles.sysText}>B.Tech Computer Engineering</p>
                                <div style={styles.spacer} />
                                <p style={styles.sysText}>Detecting modules: AI/ML · Full Stack · REST APIs · 3D</p>
                                <div style={styles.spacer} />
                                {showLoadingResources ? (
                                    progress >= 1 ? (
                                        <p style={styles.successText}>✓ ALL MODULES LOADED SUCCESSFULLY</p>
                                    ) : (
                                        <p className="loading" style={styles.loadingText}>
                                            LOADING ASSETS ({loaded}/{toLoad === 0 ? '—' : toLoad})
                                        </p>
                                    )
                                ) : (
                                    <p className="loading" style={styles.loadingText}>INITIALIZING</p>
                                )}
                            </>
                        )}

                        {/* Progress bar */}
                        {showLoadingResources && (
                            <div style={styles.progressBarOuter}>
                                <div style={Object.assign({}, styles.progressBarInner, { width: progressBarWidth })} />
                                <div style={styles.progressBarGlow} className="progress-glow" />
                            </div>
                        )}

                        <div style={styles.spacer} />
                        <div style={styles.resourcesLoadingList}>
                            {resources.map((sourceName) => (
                                <p key={sourceName} style={styles.resourceText}>{sourceName}</p>
                            ))}
                        </div>
                        <div style={styles.spacer} />
                        {showLoadingResources && doneLoading && (
                            <p style={styles.readyText}>
                                ► Launching <span style={styles.highlight}>Anjali Tripathi Portfolio</span> — ready
                            </p>
                        )}
                        <div style={styles.spacer} />
                        <span className="blinking-cursor" />
                    </div>

                    <div style={styles.dividerLine} />

                    {/* Footer */}
                    <div style={styles.footer} className="loading-screen-footer">
                        <p style={styles.footerText}>
                            HackX 2025 Winner · MERN · Next.js · TensorFlow · PyTorch · OpenCV
                        </p>
                        <p style={styles.footerText}>{getCurrentDate()}</p>
                    </div>
                </div>
            )}

            {/* Start popup */}
            <div
                style={Object.assign({}, styles.popupContainer, {
                    opacity: startPopupOpacity,
                    pointerEvents: startPopupOpacity > 0 ? 'auto' : 'none',
                })}
            >
                <div style={styles.startPopup} className="start-popup-card">
                    {/* Decorative corner accents */}
                    <div style={styles.cornerTL} />
                    <div style={styles.cornerTR} />
                    <div style={styles.cornerBL} />
                    <div style={styles.cornerBR} />

                    <p style={styles.popupTitle}>ANJALI TRIPATHI</p>
                    <p style={styles.popupSubtitle}>Full Stack Developer · AI/ML Engineer</p>
                    <div style={styles.popupDivider} />

                    <div style={styles.popupStats}>
                        <div style={styles.popupStat}>
                            <span style={styles.statValue}>6+</span>
                            <span style={styles.statLabel}>Internships</span>
                        </div>
                        <div style={styles.popupStatDivider} />
                        <div style={styles.popupStat}>
                            <span style={styles.statValue}>4+</span>
                            <span style={styles.statLabel}>AI Projects</span>
                        </div>
                        <div style={styles.popupStatDivider} />
                        <div style={styles.popupStat}>
                            <span style={styles.statValue}>HackX</span>
                            <span style={styles.statLabel}>Winner</span>
                        </div>
                    </div>

                    <div style={styles.popupDivider} />

                    {mobileWarning && (
                        <>
                            <p style={styles.warningText}>⚠ Best viewed on a desktop or laptop</p>
                            <div style={styles.spacer} />
                        </>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <p style={styles.startPromptText}>Click START to explore{'\xa0'}</p>
                        <span className="blinking-cursor" />
                    </div>
                    <div style={styles.startButtonContainer}>
                        <div className="bios-start-button" onClick={start}>
                            <p>START</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* WebGL error */}
            {webGLError && (
                <div
                    style={Object.assign({}, styles.popupContainer, {
                        opacity: webGLErrorOpacity,
                    })}
                >
                    <div style={styles.startPopup}>
                        <p style={{ color: '#ff4444', fontFamily: 'monospace' }}>
                            <b>CRITICAL ERROR:</b> No WebGL Detected
                        </p>
                        <div style={styles.spacer} />
                        <p style={{ fontFamily: 'monospace', color: '#ccc' }}>
                            WebGL is required to run this site.
                        </p>
                        <p style={{ fontFamily: 'monospace', color: '#ccc' }}>
                            Please enable it or switch to a WebGL-capable browser.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const NEON_CYAN = '#00f5ff';
const NEON_PURPLE = '#bf00ff';
const NEON_GREEN = '#00ff88';
const NEON_GOLD = '#ffd700';
const DIM_WHITE = '#c8d6e5';

const styles: StyleSheetCSS = {
    overlay: {
        backgroundColor: '#020810',
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
        boxSizing: 'border-box',
        fontSize: 14,
        letterSpacing: 0.6,
        overflow: 'hidden',
    },
    scanlines: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'background-position-y 0.03s linear',
    },
    vignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
        zIndex: 9,
    },
    spacer: { height: 14 },
    header: {
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: `1px solid rgba(0, 245, 255, 0.2)`,
    },
    logoContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    logoLine1: {
        fontSize: 28,
        fontWeight: 900,
        letterSpacing: 8,
        color: '#ffffff',
        textShadow: `0 0 20px ${NEON_CYAN}, 0 0 50px rgba(0,245,255,0.3)`,
        fontFamily: 'monospace',
        lineHeight: 1.1,
    } as React.CSSProperties,
    logoLine2: {
        fontSize: 13,
        fontWeight: 400,
        letterSpacing: 5,
        color: NEON_CYAN,
        textShadow: `0 0 10px ${NEON_CYAN}`,
        fontFamily: 'monospace',
        lineHeight: 1.4,
    } as React.CSSProperties,
    logoTagline: {
        marginTop: 6,
    },
    taglineText: {
        fontSize: 10,
        color: NEON_PURPLE,
        letterSpacing: 3,
        fontFamily: 'monospace',
        textShadow: `0 0 8px ${NEON_PURPLE}`,
    } as React.CSSProperties,
    headerInfo: {
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    headerInfoText: {
        fontSize: 10,
        color: '#607080',
        fontFamily: 'monospace',
        letterSpacing: 0.8,
    } as React.CSSProperties,
    dividerLine: {
        height: 1,
        background: `linear-gradient(90deg, transparent, ${NEON_CYAN}44, ${NEON_PURPLE}44, transparent)`,
        margin: '4px 0',
    },
    body: {
        flex: 1,
        overflowY: 'hidden' as 'hidden',
    },
    sysText: {
        fontSize: 12,
        color: DIM_WHITE,
        fontFamily: 'monospace',
        letterSpacing: 0.5,
        lineHeight: 1.6,
    } as React.CSSProperties,
    highlight: {
        color: NEON_CYAN,
        textShadow: `0 0 8px ${NEON_CYAN}`,
    } as React.CSSProperties,
    loadingText: {
        fontSize: 13,
        color: NEON_CYAN,
        fontFamily: 'monospace',
        letterSpacing: 2,
        textShadow: `0 0 10px ${NEON_CYAN}`,
    } as React.CSSProperties,
    successText: {
        fontSize: 13,
        color: NEON_GREEN,
        fontFamily: 'monospace',
        letterSpacing: 2,
        textShadow: `0 0 10px ${NEON_GREEN}`,
    } as React.CSSProperties,
    readyText: {
        fontSize: 12,
        color: '#a0c4ff',
        fontFamily: 'monospace',
        letterSpacing: 0.8,
    } as React.CSSProperties,
    progressBarOuter: {
        marginTop: 10,
        marginBottom: 4,
        height: 6,
        background: 'rgba(0,245,255,0.1)',
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative',
        border: `1px solid rgba(0,245,255,0.25)`,
    },
    progressBarInner: {
        height: '100%',
        background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_PURPLE})`,
        borderRadius: 3,
        transition: 'width 0.3s ease',
        boxShadow: `0 0 12px ${NEON_CYAN}, 0 0 24px rgba(0,245,255,0.4)`,
    },
    progressBarGlow: {
        position: 'absolute',
        top: -3,
        left: 0,
        right: 0,
        height: 12,
        background: `linear-gradient(90deg, transparent, ${NEON_CYAN}22)`,
        pointerEvents: 'none',
    },
    resourcesLoadingList: {
        marginTop: 4,
    },
    resourceText: {
        fontSize: 10,
        color: '#405060',
        fontFamily: 'monospace',
        letterSpacing: 0.3,
        lineHeight: 1.5,
    } as React.CSSProperties,
    footer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid rgba(0, 245, 255, 0.15)`,
    },
    footerText: {
        fontSize: 9,
        color: '#354045',
        fontFamily: 'monospace',
        letterSpacing: 0.5,
    } as React.CSSProperties,
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'opacity 0.4s ease',
    },
    startPopup: {
        background: 'rgba(2, 8, 16, 0.92)',
        border: `1px solid rgba(0, 245, 255, 0.35)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: `0 0 40px rgba(0,245,255,0.12), 0 0 80px rgba(191,0,255,0.08), inset 0 0 60px rgba(0,245,255,0.03)`,
        minWidth: 360,
    },
    cornerTL: {
        position: 'absolute', top: -1, left: -1,
        width: 16, height: 16,
        borderTop: `2px solid ${NEON_CYAN}`,
        borderLeft: `2px solid ${NEON_CYAN}`,
    },
    cornerTR: {
        position: 'absolute', top: -1, right: -1,
        width: 16, height: 16,
        borderTop: `2px solid ${NEON_CYAN}`,
        borderRight: `2px solid ${NEON_CYAN}`,
    },
    cornerBL: {
        position: 'absolute', bottom: -1, left: -1,
        width: 16, height: 16,
        borderBottom: `2px solid ${NEON_PURPLE}`,
        borderLeft: `2px solid ${NEON_PURPLE}`,
    },
    cornerBR: {
        position: 'absolute', bottom: -1, right: -1,
        width: 16, height: 16,
        borderBottom: `2px solid ${NEON_PURPLE}`,
        borderRight: `2px solid ${NEON_PURPLE}`,
    },
    popupTitle: {
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: 8,
        color: '#ffffff',
        textShadow: `0 0 20px ${NEON_CYAN}, 0 0 40px rgba(0,245,255,0.3)`,
        fontFamily: 'monospace',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 6,
    } as React.CSSProperties,
    popupSubtitle: {
        fontSize: 10,
        letterSpacing: 3,
        color: '#a0c4ff',
        fontFamily: 'monospace',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 2,
    } as React.CSSProperties,
    popupDivider: {
        width: '100%',
        height: 1,
        background: `linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)`,
        margin: '14px 0',
    },
    popupStats: {
        display: 'flex',
        flexDirection: 'row',
        gap: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    popupStat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 700,
        color: NEON_CYAN,
        textShadow: `0 0 14px ${NEON_CYAN}`,
        fontFamily: 'monospace',
        lineHeight: 1,
    },
    statLabel: {
        fontSize: 8,
        color: '#607080',
        fontFamily: 'monospace',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    popupStatDivider: {
        width: 1,
        height: 32,
        background: 'rgba(0,245,255,0.2)',
    },
    warningText: {
        color: NEON_GOLD,
        fontFamily: 'monospace',
        fontSize: 11,
        textAlign: 'center',
        textShadow: `0 0 8px ${NEON_GOLD}`,
    } as React.CSSProperties,
    startPromptText: {
        fontSize: 12,
        color: '#c8d6e5',
        fontFamily: 'monospace',
        letterSpacing: 1,
    } as React.CSSProperties,
    startButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    blinkingContainer: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        transition: 'opacity 0.4s ease, filter 0.1s ease, transform 0.1s ease',
    },
};

export default LoadingScreen;
