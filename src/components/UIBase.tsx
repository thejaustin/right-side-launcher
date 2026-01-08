import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function Toggle({ label, desc, value, onChange }: { label: string, desc?: string, value: boolean, onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{label}</span>
                {desc && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{desc}</span>}
            </div>
            <div onClick={() => onChange(!value)} style={{ width: '36px', height: '18px', background: value ? '#3b82f6' : 'rgba(255,255,255,0.15)', borderRadius: '9px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <motion.div animate={{ x: value ? 20 : 2 }} style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
        </div>
    )
}

export function OptionSelect({ label, desc, options, current, accent, onChange }: { label: string, desc?: string, options: string[], current: string, accent: string, onChange: (v: string) => void }) {
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700' }}>{label}</span>
                {desc && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{desc}</span>}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {options.map((opt: string) => (
                    <div key={opt} onClick={() => onChange(opt)} style={{ flex: 1, minWidth: '70px', padding: '8px 4px', textAlign: 'center', background: current === opt ? accent : 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', color: current === opt ? (accent === '#ffffff' ? '#000' : 'white') : 'rgba(255,255,255,0.7)', transition: 'all 0.2s', border: `1px solid ${current === opt ? 'rgba(255,255,255,0.2)' : 'transparent'}`, fontWeight: '600' }}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function Slider({ label, desc, value, min, max, step = 1, unit, onChange, isPercent = false }: { label: string, desc?: string, value: number, min: number, max: number, step?: number, unit: string, onChange: (v: number) => void, isPercent?: boolean }) {
    const [localVal, setLocalVal] = useState(isPercent ? Math.round(value * 100).toString() : value.toString());

    useEffect(() => {
        setLocalVal(isPercent ? Math.round(value * 100).toString() : value.toString());
    }, [value, isPercent]);

    const handleManualInput = (val: string) => {
        setLocalVal(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            onChange(isPercent ? Math.max(min, Math.min(max, num / 100)) : Math.max(min, Math.min(max, num)));
        }
    };

    return (
        <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '600', color: 'white' }}>{label}</span>
                    {desc && <span style={{ fontSize: '10px', opacity: 0.5 }}>{desc}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    <input 
                        type="text" 
                        value={localVal} 
                        onChange={(e) => handleManualInput(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '30px', fontSize: '11px', textAlign: 'right', outline: 'none' }}
                    />
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>{unit}</span>
                </div>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }} />
        </div>
    )
}