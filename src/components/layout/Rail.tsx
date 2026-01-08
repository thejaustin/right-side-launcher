import React from 'react';
import { useSettings } from '../../context/SettingsContext';

interface RailProps {
    alphabet: string[];
    onMouseMove: (e: React.MouseEvent) => void;
    onOpenSettings: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
    time: Date;
}

export default function Rail({ alphabet, onMouseMove, onOpenSettings, containerRef, time }: RailProps) {
    const { settings } = useSettings();

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '');
    };

    return (
        <div style={{ 
            width: '40px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: 'rgba(0,0,0,0.3)', 
            zIndex: 100, 
            paddingTop: '10px' 
        }}>
            {/* CLOCK SECTION */}
            {settings.list.showClock && (
                <div style={{ 
                    writingMode: 'vertical-rl', 
                    textOrientation: 'mixed', 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    letterSpacing: '1px', 
                    paddingBottom: '15px', 
                    marginBottom: '5px' 
                }}>
                    {formatTime(time)}
                </div>
            )}

            {/* ALPHABET SEEKER */}
            <div 
                ref={containerRef} 
                onMouseMove={onMouseMove} 
                style={{ 
                    flex: 1, 
                    width: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    padding: '10px 0', 
                    cursor: 'default' 
                }}
            >
                {alphabet.map((char) => (
                    <div key={char} style={{ 
                        fontSize: '9px', 
                        color: 'rgba(255,255,255,0.25)', 
                        fontWeight: '800', 
                        textAlign: 'center' 
                    }}>
                        {char}
                    </div>
                ))}
            </div>

            {/* SETTINGS TRIGGER */}
            <div 
                onClick={(e) => { e.stopPropagation(); onOpenSettings(); }} 
                style={{ 
                    height: '44px', 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer', 
                    color: 'rgba(255,255,255,0.4)', 
                    fontSize: '18px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}
            >
                ⚙
            </div>
        </div>
    );
}
