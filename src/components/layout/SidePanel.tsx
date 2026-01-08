import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

interface SidePanelProps {
    children: React.ReactNode;
    isExpanded: boolean;
    isResizing: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onWheel: (e: React.WheelEvent) => void;
    onMouseDownResize: (e: React.MouseEvent) => void;
}

export default function SidePanel({
    children,
    isExpanded,
    isResizing,
    onMouseEnter,
    onMouseLeave,
    onWheel,
    onMouseDownResize
}: SidePanelProps) {
    const { settings } = useSettings();
    const isRight = settings.layout.anchorSide === 'right';
    const collapsedX = isRight ? settings.layout.windowWidth - settings.layout.triggerWidth : -(settings.layout.windowWidth - settings.layout.triggerWidth);

    const panelStyles: any = {
        glass: {
            background: `rgba(10, 10, 12, ${settings.theme.opacity})`,
            backdropFilter: `blur(${settings.theme.blurIntensity}px) saturate(${settings.theme.saturation}%)`,
            borderLeft: isRight ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRight: !isRight ? '1px solid rgba(255,255,255,0.1)' : 'none',
        },
        glassmorphism: {
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))`,
            backdropFilter: `blur(${settings.theme.blurIntensity}px) saturate(${settings.theme.saturation}%)`,
            borderLeft: isRight ? '1px solid rgba(255, 255, 255, 0.18)' : 'none',
            borderRight: !isRight ? '1px solid rgba(255, 255, 255, 0.18)' : 'none',
            boxShadow: settings.theme.showOuterGlow ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : 'none',
        },
        minimal: {
            background: `rgba(0, 0, 0, ${settings.theme.opacity})`,
            backdropFilter: 'none',
            borderLeft: 'none',
            borderRight: 'none',
        },
        solid: {
            background: settings.theme.uiStyle === 'solid' && settings.theme.opacity < 1 ? `rgba(10, 10, 10, ${settings.theme.opacity})` : '#0a0a0a',
            backdropFilter: 'none',
            borderLeft: isRight ? '2px solid ' + settings.theme.accentColor : 'none',
            borderRight: !isRight ? '2px solid ' + settings.theme.accentColor : 'none',
        },
        'material-you': {
            background: settings.theme.accentColor + '15',
            backdropFilter: `blur(${settings.theme.blurIntensity}px)`,
            borderLeft: 'none',
            borderRight: 'none',
            boxShadow: settings.theme.showOuterGlow ? `0 0 40px ${settings.theme.accentColor}22` : 'none',
        }
    };

    return (
        <motion.div 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onWheel={onWheel}
            initial={false}
            animate={{ x: isExpanded ? 0 : collapsedX }}
            transition={{ type: 'spring', damping: 30, stiffness: settings.list.stiffness }}
            style={{
                width: `${settings.layout.windowWidth}px`, 
                height: '100%',
                boxShadow: settings.theme.showOuterGlow ? `${isRight ? '-' : ''}10px 0 40px rgba(0,0,0,0.6)` : 'none',
                display: 'flex', 
                flexDirection: isRight ? 'row-reverse' : 'row',
                pointerEvents: 'auto', 
                borderRadius: isExpanded ? 0 : (isRight ? `${settings.theme.borderRadius}px 0 0 ${settings.theme.borderRadius}px` : `0 ${settings.theme.borderRadius}px ${settings.theme.borderRadius}px 0`),
                ...panelStyles[settings.theme.uiStyle],
                position: 'relative'
            }}
        >
            {/* RESIZE HANDLE */}
            <div 
                onMouseDown={onMouseDownResize}
                style={{
                    position: 'absolute',
                    top: 0,
                    [isRight ? 'left' : 'right']: -2,
                    width: '6px',
                    height: '100%',
                    cursor: 'ew-resize',
                    zIndex: 1000,
                    background: isResizing ? settings.theme.accentColor : 'transparent',
                    transition: 'background 0.2s'
                }}
            />

            {children}
        </motion.div>
    );
}
