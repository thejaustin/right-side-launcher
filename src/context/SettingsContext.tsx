import React, { createContext, useContext, useState, useEffect } from 'react';
import { LauncherSettings, DEFAULT_SETTINGS, THEME_PACKS } from '../types';

const ipcRenderer = (window as any).require ? (window as any).require('electron').ipcRenderer : null;

interface SettingsContextType {
    settings: LauncherSettings;
    updateSetting: (category: keyof LauncherSettings | 'root', key: string, value: any) => void;
    applyPreset: (name: string) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<LauncherSettings>(() => {
        const saved = localStorage.getItem('launcherSettings');
        if (!saved) return DEFAULT_SETTINGS;
        try {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                theme: { ...DEFAULT_SETTINGS.theme, ...parsed.theme },
                list: { ...DEFAULT_SETTINGS.list, ...parsed.list },
                behavior: { ...DEFAULT_SETTINGS.behavior, ...parsed.behavior },
                layout: { ...DEFAULT_SETTINGS.layout, ...parsed.layout }
            };
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    });

    const updateSetting = (category: keyof LauncherSettings | 'root', key: string, value: any) => {
        setSettings(prev => {
            if (category === 'root') return { ...prev, [key]: value };
            const cat = (prev as any)[category];
            return {
                ...prev,
                [category]: { ...cat, [key]: value }
            };
        });
    };

    const applyPreset = (presetName: string) => {
        const preset = THEME_PACKS[presetName];
        if (preset) {
            setSettings(prev => ({
                ...prev,
                ...preset,
                theme: { ...prev.theme, ...(preset.theme || {}) },
                list: { ...prev.list, ...(preset.list || {}) },
                behavior: { ...prev.behavior, ...(preset.behavior || {}) },
                layout: { ...prev.layout, ...(preset.layout || {}) }
            }));
        }
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    useEffect(() => {
        localStorage.setItem('launcherSettings', JSON.stringify(settings));
        if (ipcRenderer) {
            ipcRenderer.invoke('set-always-on-top', settings.behavior.alwaysOnTop);
            ipcRenderer.invoke('update-window-layout', { 
                side: settings.layout.anchorSide, 
                width: settings.layout.windowWidth 
            });
        }
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, applyPreset, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};