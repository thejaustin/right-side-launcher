import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface SearchBoxProps {
    value: string;
    onChange: (val: string) => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

export default function SearchBox({ value, onChange, inputRef }: SearchBoxProps) {
    const { settings } = useSettings();

    if (!settings.list.showSearch) return null;

    const isMaterial = settings.theme.uiStyle === 'material-you';
    
    // MD3 Tonal Surface
    const background = isMaterial 
        ? `${settings.theme.accentColor}1A` // 10% opacity for tonal surface
        : (settings.theme.uiStyle === 'glassmorphism' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)');

    const borderRadius = isMaterial ? 28 : settings.theme.borderRadius;

    return (
        <div style={{ padding: '25px 25px 15px 25px', zIndex: 50 }}>
            <div style={{
                width: '100%',
                background,
                borderRadius: `${borderRadius}px`,
                border: isMaterial ? 'none' : `1px solid ${value ? settings.theme.accentColor : 'rgba(255,255,255,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                boxShadow: isMaterial && value ? `0 4px 12px ${settings.theme.accentColor}22` : 'none'
            }}>
                {isMaterial && (
                    <div style={{ padding: '0 12px', color: settings.theme.accentColor, fontSize: '18px' }}>
                        🔍
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text" 
                    placeholder="Search apps..." 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ 
                        flex: 1,
                        padding: isMaterial ? '12px 0' : '12px 16px', 
                        background: 'transparent',
                        border: 'none',
                        color: 'white', 
                        fontSize: isMaterial ? '16px' : '14px', 
                        outline: 'none',
                        fontWeight: isMaterial ? '500' : 'normal'
                    }}
                />
            </div>
        </div>
    );
}