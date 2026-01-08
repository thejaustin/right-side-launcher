import { useEffect, useRef, useCallback } from 'react';
import { LauncherSettings } from '../types';

const ipcRenderer = (window as any).require ? (window as any).require('electron').ipcRenderer : null;

interface MouseInteractionProps {
    isExpanded: boolean;
    setIsExpanded: (val: boolean) => void;
    showSettings: boolean;
    settings: LauncherSettings;
    isResizing: boolean;
    setIsResizing: (val: boolean) => void;
    setSearchQuery: (val: string) => void;
    updateSetting: (category: keyof LauncherSettings | 'root', key: string, value: any) => void;
}

export function useMouseInteraction({
    isExpanded,
    setIsExpanded,
    showSettings,
    settings,
    isResizing,
    setIsResizing,
    setSearchQuery,
    updateSetting
}: MouseInteractionProps) {
    const lastIgnoreState = useRef<boolean>(true);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!ipcRenderer) return;

        const isRight = settings.layout.anchorSide === 'right';
        const panelWidth = settings.layout.windowWidth;
        const triggerZone = settings.layout.triggerWidth;
        
        // 1. HANDLE RESIZING
        if (isResizing) {
            const newWidth = isRight 
                ? window.innerWidth - e.clientX 
                : e.clientX;
            // Immediate update for feedback
            updateSetting('layout', 'windowWidth', Math.max(200, Math.min(800, newWidth)));
            
            // While resizing, we MUST capture events
            if (lastIgnoreState.current) {
                ipcRenderer.send('set-ignore-mouse-events', false);
                lastIgnoreState.current = false;
            }
            return;
        }

        // 2. HANDLE SETTINGS MODAL
        if (showSettings) {
            if (lastIgnoreState.current) {
                ipcRenderer.send('set-ignore-mouse-events', false);
                lastIgnoreState.current = false;
            }
            return;
        }

        // 3. HANDLE REGULAR INTERACTION
        const currentWidth = isExpanded ? panelWidth : triggerZone;
        const isOverPanel = isRight 
            ? e.clientX >= window.innerWidth - currentWidth
            : e.clientX <= currentWidth;

        if (isOverPanel !== !lastIgnoreState.current) {
            ipcRenderer.send('set-ignore-mouse-events', !isOverPanel, isOverPanel ? {} : { forward: true });
            lastIgnoreState.current = !isOverPanel;
        }

        if (!settings.behavior.autoHide) return;

        if (!isExpanded && isOverPanel) {
            setIsExpanded(true);
        } else if (isExpanded) {
            const buffer = 40;
            const hasLeft = isRight 
                ? e.clientX < (window.innerWidth - panelWidth - buffer)
                : e.clientX > (panelWidth + buffer);
            
            if (hasLeft) {
                setIsExpanded(false);
                setSearchQuery("");
            }
        }
    }, [isExpanded, showSettings, settings.layout, settings.behavior.autoHide, isResizing, setIsExpanded, setSearchQuery, updateSetting]);

    const handleMouseUp = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
        }
    }, [isResizing, setIsResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return { lastIgnoreState };
}