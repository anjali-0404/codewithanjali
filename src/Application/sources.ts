/**
 * sources.ts — Anjali Tripathi Portfolio
 *
 * Only audio + monitor overlay textures are loaded now.
 * The 3D scene geometry is built procedurally in GameRoom.ts.
 */
const sources: Resource[] = [
    // ── Monitor screen overlays ──────────────────────────────────────────
    {
        name: 'monitorSmudgeTexture',
        type: 'texture',
        path: 'textures/monitor/layers/compressed/smudges.jpg',
    },
    {
        name: 'monitorShadowTexture',
        type: 'texture',
        path: 'textures/monitor/layers/compressed/shadow-compressed.png',
    },

    // ── Mouse sounds ─────────────────────────────────────────────────────
    {
        name: 'mouseDown',
        type: 'audio',
        path: 'audio/mouse/mouse_down.mp3',
    },
    {
        name: 'mouseUp',
        type: 'audio',
        path: 'audio/mouse/mouse_up.mp3',
    },

    // ── Keyboard sounds ───────────────────────────────────────────────────
    {
        name: 'keyboardKeydown1',
        type: 'audio',
        path: 'audio/keyboard/key_1.mp3',
    },
    {
        name: 'keyboardKeydown2',
        type: 'audio',
        path: 'audio/keyboard/key_2.mp3',
    },
    {
        name: 'keyboardKeydown3',
        type: 'audio',
        path: 'audio/keyboard/key_3.mp3',
    },
    {
        name: 'keyboardKeydown4',
        type: 'audio',
        path: 'audio/keyboard/key_4.mp3',
    },
    {
        name: 'keyboardKeydown5',
        type: 'audio',
        path: 'audio/keyboard/key_5.mp3',
    },
    {
        name: 'keyboardKeydown6',
        type: 'audio',
        path: 'audio/keyboard/key_6.mp3',
    },

    // ── Startup / atmosphere ─────────────────────────────────────────────
    {
        name: 'startup',
        type: 'audio',
        path: 'audio/startup/startup.mp3',
    },
    {
        name: 'office',
        type: 'audio',
        path: 'audio/atmosphere/office.mp3',
    },
    {
        name: 'ccType',
        type: 'audio',
        path: 'audio/cc/type.mp3',
    },
];

export default sources;
