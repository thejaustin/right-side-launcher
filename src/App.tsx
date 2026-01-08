import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { AppItem } from './types'
import { useSettings } from './context/SettingsContext'
import { useMouseInteraction } from './hooks/useMouseInteraction'
import SettingsModal from './components/SettingsModal'
import AppItemRow from './components/AppItemRow'
import Rail from './components/layout/Rail'
import SearchBox from './components/layout/SearchBox'
import SidePanel from './components/layout/SidePanel'

const ipcRenderer = (window as any).require ? (window as any).require('electron').ipcRenderer : null;

export default function App() {
  const { settings, applyPreset, updateSetting } = useSettings();
  const [apps, setApps] = useState<AppItem[]>([{ name: "Loading...", path: "" }])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<'style' | 'interaction' | 'layout'>('style')
  const [isResizing, setIsResizing] = useState(false)
  const [time, setTime] = useState(new Date());
  const [showHint, setShowHint] = useState(() => !localStorage.getItem('hideHint'));
  
  const [pinnedPaths, setPinnedApps] = useState<string[]>(() => {
      const saved = localStorage.getItem('pinnedApps');
      return saved ? JSON.parse(saved) : [];
  });

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const springConfig = { damping: 35, stiffness: settings.list.stiffness, mass: 0.5 };
  const cursorY = useSpring(0, springConfig);
  const scrollY = useSpring(0, springConfig);

  // LOGIC: Consolidated Mouse Interaction
  useMouseInteraction({
      isExpanded,
      setIsExpanded,
      showSettings,
      settings,
      isResizing,
      setIsResizing,
      setSearchQuery,
      updateSetting
  });

  const processedApps = useMemo(() => {
      const pinned = apps.filter(a => pinnedPaths.includes(a.path));
      const unpinned = apps.filter(a => !pinnedPaths.includes(a.path));
      const sorted = [...pinned, ...unpinned];
      if (!searchQuery) return sorted;
      const q = searchQuery.toLowerCase();
      return sorted.filter(app => app.name && app.name.toLowerCase().includes(q));
  }, [apps, pinnedPaths, searchQuery]);

  useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      localStorage.setItem('pinnedApps', JSON.stringify(pinnedPaths));
  }, [pinnedPaths]);

  useEffect(() => {
    if (ipcRenderer) {
        ipcRenderer.on('apps-loaded', (_event: any, loadedApps: AppItem[]) => {
            if (loadedApps && loadedApps.length > 0) setApps(loadedApps);
        });
        
        ipcRenderer.on('toggle-launcher', () => {
            setIsExpanded(prev => {
                const next = !prev;
                ipcRenderer.send('set-ignore-mouse-events', !next, next ? { forward: false } : { forward: true });
                return next;
            });
        });
    }
    return () => {
        ipcRenderer?.removeAllListeners('toggle-launcher');
        ipcRenderer?.removeAllListeners('apps-loaded');
    };
  }, []);

  useEffect(() => {
      if (isExpanded && searchInputRef.current && settings.list.showSearch) {
          searchInputRef.current.focus();
      }
  }, [isExpanded, settings.list.showSearch]);

  const handleTogglePin = (path: string) => {
      setPinnedApps(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  const handleRailMove = (e: React.MouseEvent) => {
    if (!containerRef.current || processedApps.length === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    cursorY.set(e.clientY);
    
    const relativeY = e.clientY - rect.top;
    const pct = Math.max(0, Math.min(1, relativeY / rect.height));
    
    // Sync with AppItemRow height: icon + spacing + 16
    const itemHeight = settings.list.iconSize + settings.list.itemSpacing + 16;
    const totalHeight = processedApps.length * itemHeight;
    
    // Sync with AppItemRow offset: searchBarHeight (85 or 20)
    const searchBarHeight = settings.list.showSearch ? 85 : 20;
    const targetScroll = (pct * totalHeight) - relativeY - searchBarHeight;
    scrollY.set(-targetScroll);
  }

  const launch = (path: string) => {
    if (ipcRenderer && path) ipcRenderer.invoke('launch-app', path)
    if (settings.behavior.autoHide) {
        setIsExpanded(false);
        setSearchQuery("");
        if (ipcRenderer) ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
    }
  }

  const getAppColor = (name: string) => {
    if (settings.theme.useGlobalAccent) return settings.theme.accentColor;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#00ffff', '#ff00ff'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  }

  const isRight = settings.layout.anchorSide === 'right';

  return (
    <div 
      style={{ 
        width: '100vw', height: '100vh', position: 'absolute', left: 0, top: 0,
        fontFamily: '"Segoe UI Variable Text", "Segoe UI", sans-serif', 
        userSelect: 'none', overflow: 'hidden', pointerEvents: 'none',
        display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start',
      }} 
    >
      <SidePanel
        isExpanded={isExpanded}
        isResizing={isResizing}
        onMouseEnter={() => !isResizing && setIsExpanded(true)}
        onMouseLeave={() => isExpanded && !showSettings && settings.behavior.autoHide && setIsExpanded(false)}
        onWheel={(e) => scrollY.set(scrollY.get() - e.deltaY)}
        onMouseDownResize={(e) => { e.preventDefault(); setIsResizing(true); }}
      >
          <Rail 
            alphabet={alphabet}
            time={time}
            containerRef={containerRef}
            onMouseMove={handleRailMove}
            onOpenSettings={() => setShowSettings(true)}
          />

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <SearchBox 
                value={searchQuery}
                onChange={setSearchQuery}
                inputRef={searchInputRef}
            />

            <div style={{ flex: 1, position: 'relative', width: '100%', overflow: 'hidden' }}>
                <motion.div style={{ position: 'absolute', top: 0, left: 0, width: '100%', y: scrollY }}>
                    {processedApps.length > 0 ? processedApps.map((app, index) => (
                        <AppItemRow 
                            key={`${app.name}-${index}`}
                            app={app} 
                            index={index} 
                            cursorY={cursorY}
                            scrollY={scrollY}
                            settings={settings}
                            launch={launch}
                            getAppColor={getAppColor}
                            isPinned={pinnedPaths.includes(app.path)}
                            onTogglePin={handleTogglePin}
                        />
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontStyle: 'italic' }}>
                            No apps found for "{searchQuery}"
                        </div>
                    )}
                </motion.div>
            </div>
          </div>

          {/* INTEGRATED MODAL (SIDE) */}
          {showSettings && settings.modalStyle === 'side' && (
              <div style={{ position: 'absolute', inset: 0, background: settings.theme.uiStyle === 'material-you' ? 'rgba(20,20,25,0.98)' : 'rgba(10,10,12,0.98)', zIndex: 1000, pointerEvents: 'auto' }}>
                  <SettingsModal 
                    show={showSettings}
                    onClose={() => setShowSettings(false)}
                    onUpdate={updateSetting}
                    onApplyPreset={applyPreset}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
              </div>
          )}
      </SidePanel>

      {/* INDEPENDENT MODAL (CENTER/COMPACT) */}
      {showSettings && settings.modalStyle !== 'side' && (
          <SettingsModal 
            show={showSettings}
            onClose={() => setShowSettings(false)}
            onUpdate={updateSetting}
            onApplyPreset={applyPreset}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
      )}

      <AnimatePresence>
          {showHint && !isExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ 
                    position: 'absolute', bottom: '40px', right: isRight ? '60px' : 'auto', left: isRight ? 'auto' : '60px',
                    background: 'rgba(30,30,35,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 20px', borderRadius: '12px', color: 'white', zIndex: 1000,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', pointerEvents: 'auto'
                }}
              >
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Quick Tip</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Hover the edge or press <b>Alt + Space</b> to open.</div>
                  <button 
                    onClick={() => { setShowHint(false); localStorage.setItem('hideHint', 'true'); }}
                    style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '10px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                      Got it
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
