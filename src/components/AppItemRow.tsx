import { useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { AppItem, LauncherSettings } from '../types'

const ipcRenderer = (window as any).require ? (window as any).require('electron').ipcRenderer : null;

interface AppItemRowProps {
    app: AppItem;
    index: number;
    cursorY: any; // useSpring value
    scrollY: any; // useSpring value
    settings: LauncherSettings;
    launch: (path: string) => void;
    getAppColor: (name: string) => string;
    isPinned: boolean;
    onTogglePin: (path: string) => void;
}

export default function AppItemRow({
    app,
    index,
    cursorY,
    scrollY,
    settings,
    launch,
    getAppColor,
    isPinned,
    onTogglePin
}: AppItemRowProps) {
    const itemHeight = settings.list.iconSize + settings.list.itemSpacing + 16;
    
    const scale = useMotionValue(1);
    const xOffset = useMotionValue(0);
    const opacity = useMotionValue(0.3);
    const yPos = useMotionValue(index * itemHeight);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const z = useMotionValue(0);
    const highlightOpacity = useMotionValue(0);
    const materialHighlightWidth = useMotionValue(0);
    
    const [isHovered, setIsHovered] = useState(false);

    const isMaterial = settings.theme.uiStyle === 'material-you';

    useEffect(() => {
        const update = () => {
            const currentScroll = scrollY.get();
            const currentCursor = cursorY.get();
            
            const searchBarHeight = settings.list.showSearch ? 85 : 20;
            const itemCenterYInList = (index * itemHeight) + (itemHeight / 2);
            const itemCenterYOnScreen = itemCenterYInList + currentScroll + searchBarHeight; 
            
            const dist = Math.abs(itemCenterYOnScreen - currentCursor);
            const range = isMaterial ? 140 : 120; 
            
            rotateX.set(0); rotateY.set(0); z.set(0); highlightOpacity.set(0); materialHighlightWidth.set(0);

            if (dist < range || isHovered) {
                const influence = Math.pow(1 - Math.min(dist, range) / range, 2);
                highlightOpacity.set(influence * (isMaterial ? 0.3 : 0.15));
                
                if (isMaterial) {
                    materialHighlightWidth.set(influence * 100); // Percentage or relative
                }

                if (settings.list.effect === 'fisheye') {
                    scale.set(1 + influence * 0.5);
                    xOffset.set(influence * -40);
                    opacity.set(0.6 + influence * 0.4);
                    const push = (itemCenterYOnScreen < currentCursor ? -1 : 1) * influence * 20;
                    yPos.set((index * itemHeight) + push);
                } else if (settings.list.effect === 'skew') {
                    scale.set(1 + influence * 0.2);
                    xOffset.set(influence * -25);
                    rotateX.set((itemCenterYOnScreen < currentCursor ? 15 : -15) * influence);
                    opacity.set(0.7 + influence * 0.3);
                    yPos.set(index * itemHeight);
                } else if (settings.list.effect === 'highlight') {
                    scale.set(1 + influence * 0.4);
                    xOffset.set(influence * -30);
                    opacity.set(1);
                    highlightOpacity.set(influence * 0.4);
                    yPos.set(index * itemHeight);
                } else if (settings.list.effect === 'carousel') {
                    scale.set(1 + influence * 0.3);
                    xOffset.set(influence * -50);
                    rotateY.set((itemCenterYOnScreen < currentCursor ? -35 : 35) * influence);
                    z.set(influence * 80);
                    opacity.set(0.6 + influence * 0.4);
                    yPos.set(index * itemHeight);
                } else if (settings.list.effect === 'stepped') {
                    scale.set(1 + influence * 0.15);
                    xOffset.set(influence * -20);
                    opacity.set(0.6 + influence * 0.4);
                    yPos.set(index * itemHeight);
                } else {
                    opacity.set(1);
                    highlightOpacity.set(dist < 40 ? 0.2 : 0);
                    yPos.set(index * itemHeight);
                }
            } else {
                scale.set(1);
                xOffset.set(0);
                opacity.set(settings.list.effect === 'flat' ? 0.8 : 0.25);
                yPos.set(index * itemHeight);
            }
        };

        const unsubCursor = cursorY.onChange(update);
        const unsubScroll = scrollY.onChange(update);
        update();

        return () => { unsubCursor(); unsubScroll(); };
    }, [index, itemHeight, cursorY, scrollY, settings.list.showSearch, settings.list.showClock, settings.list.effect, isHovered, settings.list.iconSize, settings.list.itemSpacing, isMaterial]);

    const handleContextMenu = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (ipcRenderer) {
            const result = await ipcRenderer.invoke('show-app-context-menu', isPinned);
            if (result === 'toggle-pin') {
                onTogglePin(app.path);
            }
        }
    };

    const appColor = getAppColor(app.name);

    return (
        <motion.div 
            onClick={() => launch(app.path)}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                position: 'absolute', 
                right: isMaterial ? '12px' : '20px', 
                left: isMaterial ? '12px' : '20px',
                top: 0, 
                height: `${settings.list.iconSize + 16}px`,
                y: yPos, 
                scale, 
                x: xOffset, 
                opacity, 
                rotateX, rotateY, z, 
                color: 'white', 
                transformOrigin: 'right center', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap', 
                perspective: '1000px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '0 16px',
                borderRadius: `${settings.theme.borderRadius}px`,
            }}
            whileTap={{ scale: 0.92 }}
        >
            {/* Background Highlight */}
            <motion.div 
                style={{ 
                    position: 'absolute', 
                    inset: isMaterial ? '4px' : '0', 
                    background: isMaterial ? `${settings.theme.accentColor}33` : settings.theme.accentColor, 
                    opacity: highlightOpacity,
                    borderRadius: isMaterial ? '28px' : `${settings.theme.borderRadius}px`,
                    zIndex: -1,
                    boxShadow: isMaterial ? 'none' : `0 4px 15px ${settings.theme.accentColor}44`
                }} 
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: isMaterial ? '20px' : '16px' }}>
                <span style={{ 
                    fontSize: `${settings.list.fontSize}px`, 
                    fontWeight: isPinned ? '800' : (isMaterial ? '500' : '600'),
                    textShadow: !isMaterial && !isPinned ? `0 0 20px ${appColor}44` : 'none',
                    letterSpacing: isMaterial ? '0.1px' : '0.2px',
                    color: isPinned ? settings.theme.accentColor : (isMaterial ? 'rgba(255,255,255,0.95)' : 'white')
                }}>{app.name}</span>
                
                {app.icon ? (
                    <div style={{
                        position: 'relative',
                        width: `${settings.list.iconSize}px`,
                        height: `${settings.list.iconSize}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isMaterial && (
                            <motion.div 
                                style={{
                                    position: 'absolute',
                                    inset: '-8px',
                                    background: settings.theme.accentColor,
                                    borderRadius: '16px',
                                    opacity: highlightOpacity,
                                    zIndex: -1
                                }}
                            />
                        )}
                        <img 
                            src={app.icon} 
                            alt="" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain', 
                                filter: isMaterial ? 'none' : `drop-shadow(0 4px 8px rgba(0,0,0,0.3))` 
                            }} 
                        />
                    </div>
                ) : (
                    <div style={{ 
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: appColor, 
                        boxShadow: `0 0 15px ${appColor}` 
                    }} />
                )}
            </div>
        </motion.div>
    );
}
