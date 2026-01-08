import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACCENT_COLORS, THEME_PACKS, LauncherSettings } from '../types'
import { useSettings } from '../context/SettingsContext'
import { Toggle, OptionSelect, Slider } from './UIBase'

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    activeTab: 'style' | 'interaction' | 'layout';
    setActiveTab: (tab: 'style' | 'interaction' | 'layout') => void;
}

const DESCRIPTIONS: Record<string, string> = {
    uiStyle: "The overall material look of the panel.",
    listEffect: "How apps move and react to your mouse cursor.",
    autoHide: "Automatically hide when you aren't using the launcher.",
    alwaysOnTop: "Keep the launcher visible above other windows.",
    anchorSide: "Which side of the screen the launcher lives on.",
    triggerWidth: "How much of the edge is 'sensitive' when hidden.",
    stiffness: "How fast or 'heavy' the animations feel.",
    borderRadius: "The roundness of corners throughout the app."
};

export default function SettingsModal({
    show,
    onClose,
    activeTab,
    setActiveTab
}: SettingsModalProps) {
    const { settings, updateSetting, applyPreset, resetSettings } = useSettings();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const isRight = settings.layout.anchorSide === 'right';

    const modalContainerStyles = {
        side: {
            position: 'absolute' as const, inset: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: isRight ? 'flex-end' : 'flex-start',
            pointerEvents: 'auto' as const,
        },
        center: {
            position: 'absolute' as const, inset: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'auto' as const,
        },
        compact: {
            position: 'absolute' as const, inset: 0,
            background: 'transparent',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: '40px',
            pointerEvents: 'auto' as const,
        }
    };

    const modalInnerStyles = {
        side: { width: '90%', height: '100%', borderRadius: '0', background: 'rgba(20,20,25,0.98)' },
        center: { width: '85%', maxHeight: '85%', borderRadius: `${settings.theme.borderRadius}px`, background: 'rgba(25,25,30,0.95)' },
        compact: { width: '90%', maxHeight: '60%', borderRadius: `${settings.theme.borderRadius}px`, background: 'rgba(30,30,35,0.98)', border: `1px solid ${settings.theme.accentColor}44` }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ ...modalContainerStyles[settings.modalStyle], zIndex: 2000 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, x: settings.modalStyle === 'side' ? (isRight ? 50 : -50) : 0 }}
                        animate={{ scale: 1, y: 0, x: 0 }}
                        exit={{ scale: 0.9, y: 20, x: settings.modalStyle === 'side' ? (isRight ? 50 : -50) : 0 }}
                        style={{
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '25px',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                            overflowY: 'auto',
                            ...modalInnerStyles[settings.modalStyle]
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: settings.theme.accentColor }}>Settings</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setShowAdvanced(!showAdvanced)} 
                                    style={{ background: showAdvanced ? settings.theme.accentColor : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', fontSize: '10px', padding: '4px 8px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    {showAdvanced ? 'Simple' : 'Advanced'}
                                </button>
                                {settings.modalStyle === 'side' && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>}
                            </div>
                        </div>

                        {/* TABS */}
                        <div style={{ display: 'flex', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                            {(['style', 'interaction', 'layout'] as const).map(tab => (
                                <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '8px', textAlign: 'center', background: activeTab === tab ? settings.theme.accentColor : 'transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: activeTab === tab ? (settings.theme.accentColor === '#ffffff' ? '#000' : 'white') : 'rgba(255,255,255,0.6)', transition: 'all 0.2s', fontWeight: '600' }}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {activeTab === 'style' && (
                                <>
                                    <section>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Design Packs</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {Object.keys(THEME_PACKS).map(name => (
                                                <div 
                                                    key={name} 
                                                    onClick={() => applyPreset(name)} 
                                                    style={{ 
                                                        padding: '12px 10px', 
                                                        background: 'rgba(255,255,255,0.03)', 
                                                        borderRadius: '10px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '11px', 
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        textAlign: 'center',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {name}
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Color & Material</div>
                                        
                                        <div>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                                {ACCENT_COLORS.map(color => (
                                                    <motion.div 
                                                        key={color} 
                                                        onClick={() => updateSetting('theme', 'accentColor', color)} 
                                                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer', border: settings.theme.accentColor === color ? '3px solid white' : '2px solid transparent', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} 
                                                        whileHover={{ scale: 1.25 }} 
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {showAdvanced && (
                                            <>
                                                <OptionSelect label="UI Style" desc={DESCRIPTIONS.uiStyle} options={['glassmorphism', 'glass', 'minimal', 'solid', 'material-you']} current={settings.theme.uiStyle} accent={settings.theme.accentColor} onChange={(v: string) => updateSetting('theme', 'uiStyle', v)} />
                                                <OptionSelect label="Font" options={['modern', 'pixel', 'mono', 'rounded']} current={settings.theme.fontStyle} accent={settings.theme.accentColor} onChange={(v: string) => updateSetting('theme', 'fontStyle', v)} />
                                            </>
                                        )}

                                        <Slider label="Opacity" value={settings.theme.opacity} min={0.1} max={1.0} step={0.05} unit="%" onChange={(v: number) => updateSetting('theme', 'opacity', v)} isPercent />
                                        
                                        {showAdvanced && (
                                            <>
                                                <Slider label="Blur Power" value={settings.theme.blurIntensity} min={0} max={80} unit="px" onChange={(v: number) => updateSetting('theme', 'blurIntensity', v)} />
                                                <Slider label="Saturation" value={settings.theme.saturation} min={50} max={300} unit="%" onChange={(v: number) => updateSetting('theme', 'saturation', v)} />
                                                <Slider label="Corner Radius" desc={DESCRIPTIONS.borderRadius} value={settings.theme.borderRadius} min={0} max={40} unit="px" onChange={(v: number) => updateSetting('theme', 'borderRadius', v)} />
                                                <Toggle label="Edge Glow Effect" value={settings.theme.showOuterGlow} onChange={(v) => updateSetting('theme', 'showOuterGlow', v)} />
                                            </>
                                        )}
                                    </section>
                                </>
                            )}

                            {activeTab === 'interaction' && (
                                <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <OptionSelect label="Motion Effect" desc={DESCRIPTIONS.listEffect} options={['fisheye', 'flat', 'stepped', 'skew', 'highlight', 'carousel']} current={settings.list.effect} accent={settings.theme.accentColor} onChange={(v: string) => updateSetting('list', 'effect', v)} />
                                    
                                    <Toggle label="Auto-Hide" desc={DESCRIPTIONS.autoHide} value={settings.behavior.autoHide} onChange={(v) => updateSetting('behavior', 'autoHide', v)} />
                                    
                                    {showAdvanced && (
                                        <>
                                            <Slider label="Animation Snappiness" desc={DESCRIPTIONS.stiffness} value={settings.list.stiffness} min={50} max={800} step={10} unit="" onChange={(v: number) => updateSetting('list', 'stiffness', v)} />
                                            <Slider label="Item Spacing" value={settings.list.itemSpacing} min={0} max={40} unit="px" onChange={(v: number) => updateSetting('list', 'itemSpacing', v)} />
                                        </>
                                    )}
                                </section>
                            )}

                            {activeTab === 'layout' && (
                                <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <OptionSelect label="Screen Side" desc={DESCRIPTIONS.anchorSide} options={['left', 'right']} current={settings.layout.anchorSide} accent={settings.theme.accentColor} onChange={(v: string) => updateSetting('layout', 'anchorSide', v)} />
                                    
                                    <Slider label="Panel Width" value={settings.layout.windowWidth} min={200} max={800} step={10} unit="px" onChange={(v: number) => updateSetting('layout', 'windowWidth', v)} />
                                    
                                    {showAdvanced && (
                                        <>
                                            <Slider label="Trigger Zone" desc={DESCRIPTIONS.triggerWidth} value={settings.layout.triggerWidth} min={2} max={100} unit="px" onChange={(v: number) => updateSetting('layout', 'triggerWidth', v)} />
                                            <OptionSelect label="Settings Position" options={['side', 'center', 'compact']} current={settings.modalStyle} accent={settings.theme.accentColor} onChange={(v: string) => updateSetting('root', 'modalStyle', v)} />
                                        </>
                                    )}

                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }} />

                                    <Toggle label="Display Clock" value={settings.list.showClock} onChange={(v) => updateSetting('list', 'showClock', v)} />
                                    <Toggle label="Show Search Bar" value={settings.list.showSearch} onChange={(v) => updateSetting('list', 'showSearch', v)} />
                                    <Toggle label="Always Visible" desc={DESCRIPTIONS.alwaysOnTop} value={settings.behavior.alwaysOnTop} onChange={(v) => updateSetting('behavior', 'alwaysOnTop', v)} />
                                    
                                    <Slider label="Icon Size" value={settings.list.iconSize} min={16} max={96} unit="px" onChange={(v: number) => updateSetting('list', 'iconSize', v)} />
                                    <Slider label="Text Size" value={settings.list.fontSize} min={8} max={32} unit="px" onChange={(v: number) => updateSetting('list', 'fontSize', v)} />
                                </section>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button 
                                onClick={resetSettings} 
                                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                            >
                                Reset Defaults
                            </button>
                            <button 
                                onClick={onClose} 
                                style={{ flex: 2, padding: '12px', background: settings.theme.accentColor, border: 'none', borderRadius: '14px', color: settings.theme.accentColor === '#ffffff' ? '#000' : 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: `0 10px 20px ${settings.theme.accentColor}33` }}
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
