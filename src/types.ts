export interface AppItem {
    name: string;
    path: string;
    icon?: string | null;
}

export type UIStyle = 'glassmorphism' | 'glass' | 'minimal' | 'solid' | 'material-you';
export type ListEffect = 'fisheye' | 'flat' | 'stepped' | 'skew' | 'highlight' | 'carousel';
export type ModalStyle = 'side' | 'center' | 'compact';
export type FontStyle = 'modern' | 'pixel' | 'mono' | 'rounded';

export interface LauncherSettings {
    theme: {
        pack: 'fluent' | 'metro' | 'aero' | 'macos' | 'material' | 'retro' | 'custom';
        uiStyle: UIStyle;
        fontStyle: FontStyle;
        accentColor: string;
        opacity: number;
        blurIntensity: number;
        saturation: number;
        borderRadius: number;
        useGlobalAccent: boolean;
        showOuterGlow: boolean;
    };
    list: {
        effect: ListEffect;
        iconSize: number;
        fontSize: number;
        stiffness: number;
        showClock: boolean;
        showSearch: boolean;
        itemSpacing: number;
    };
    behavior: {
        autoHide: boolean;
        alwaysOnTop: boolean;
        hotkey: string;
    };
    layout: {
        anchorSide: 'left' | 'right';
        windowWidth: number;
        triggerWidth: number;
    };
    modalStyle: ModalStyle;
}

export const ACCENT_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff', '#00ffff', '#ff00ff',
];

export const DEFAULT_SETTINGS: LauncherSettings = {
    theme: {
        pack: 'fluent',
        uiStyle: 'glassmorphism',
        fontStyle: 'modern',
        accentColor: '#3b82f6',
        opacity: 0.8,
        blurIntensity: 25,
        saturation: 140,
        borderRadius: 12,
        useGlobalAccent: false,
        showOuterGlow: true,
    },
    list: {
        effect: 'fisheye',
        iconSize: 32,
        fontSize: 15,
        stiffness: 250,
        showClock: true,
        showSearch: true,
        itemSpacing: 12,
    },
    behavior: {
        autoHide: true,
        alwaysOnTop: true,
        hotkey: 'Alt+Space',
    },
    layout: {
        anchorSide: 'right',
        windowWidth: 400,
        triggerWidth: 10,
    },
    modalStyle: 'side',
};

export const THEME_PACKS: Record<string, Partial<LauncherSettings>> = {
    'Fluent (Win 11)': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'fluent', uiStyle: 'glassmorphism', opacity: 0.7, blurIntensity: 30, borderRadius: 12 },
        list: { ...DEFAULT_SETTINGS.list, effect: 'fisheye', itemSpacing: 12 }
    },
    'Metro (Win 10)': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'metro', uiStyle: 'solid', opacity: 1, blurIntensity: 0, borderRadius: 0, useGlobalAccent: true, accentColor: '#0078d7' },
        list: { ...DEFAULT_SETTINGS.list, effect: 'flat', iconSize: 36, itemSpacing: 4 }
    },
    'Aero (Win 7)': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'aero', uiStyle: 'glass', opacity: 0.4, blurIntensity: 45, accentColor: '#ffffff', borderRadius: 8 },
        list: { ...DEFAULT_SETTINGS.list, effect: 'fisheye', itemSpacing: 10 }
    },
    'macOS / iOS': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'macos', uiStyle: 'glassmorphism', opacity: 0.5, blurIntensity: 50, borderRadius: 20, accentColor: '#007aff', saturation: 180 },
        list: { ...DEFAULT_SETTINGS.list, effect: 'fisheye', iconSize: 48, fontSize: 14, stiffness: 180, itemSpacing: 16 }
    },
    'Material You': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'material', uiStyle: 'material-you', opacity: 1, blurIntensity: 0, borderRadius: 28, accentColor: '#6750A4', fontStyle: 'rounded' },
        list: { ...DEFAULT_SETTINGS.list, effect: 'highlight', iconSize: 40, itemSpacing: 24, fontSize: 16 }
    },
    'Cyberpunk': {
        theme: { ...DEFAULT_SETTINGS.theme, pack: 'custom', uiStyle: 'solid', accentColor: '#00ffff', saturation: 200, borderRadius: 2, fontStyle: 'mono' },
        list: { ...DEFAULT_SETTINGS.list, effect: 'skew', stiffness: 400, itemSpacing: 8 }
    }
};