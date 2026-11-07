import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ClassicZoneData, 
  getClassicZones, 
  saveClassicZones, 
  resetClassicZones, 
  DEFAULT_CLASSIC_ZONES 
} from '../../data/classicBoardZones';
import { MeepleIcon } from '../Meeples';
import { 
  X, 
  RotateCcw, 
  Save, 
  Copy, 
  Check, 
  Move, 
  Maximize2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Sparkles,
  Layers,
  Sliders,
  HelpCircle,
  Wheat,
  Hammer,
  Users
} from 'lucide-react';

interface ClassicBoardZoneEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

type DragMode = 'move' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se' | null;

export const ClassicBoardZoneEditor: React.FC<ClassicBoardZoneEditorProps> = ({
  isOpen,
  onClose,
  onApplied,
}) => {
  const [zones, setZones] = useState<Record<string, ClassicZoneData>>(() => getClassicZones());
  const [selectedId, setSelectedId] = useState<string>('hunting');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showMeeplesPreview, setShowMeeplesPreview] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
    initialWidth: number;
    initialHeight: number;
  }>({
    mode: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  // Reload zones when opening
  useEffect(() => {
    if (isOpen) {
      setZones(getClassicZones());
    }
  }, [isOpen]);

  // Selected zone object
  const selectedZone = zones[selectedId] || zones.hunting;

  // Update a single zone
  const updateZone = useCallback((id: string, updates: Partial<ClassicZoneData>) => {
    setZones(prev => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          ...updates,
        },
      };
    });
  }, []);

  // Handle Nudge with arrow buttons
  const nudge = useCallback((dx: number, dy: number) => {
    if (!selectedZone) return;
    const newLeft = Math.max(0, Math.min(100 - selectedZone.width, Number((selectedZone.left + dx).toFixed(2))));
    const newTop = Math.max(0, Math.min(100 - selectedZone.height, Number((selectedZone.top + dy).toFixed(2))));
    updateZone(selectedZone.id, { left: newLeft, top: newTop });
  }, [selectedZone, updateZone]);

  // Handle resize +/- buttons
  const adjustSize = useCallback((dw: number, dh: number) => {
    if (!selectedZone) return;
    const newWidth = Math.max(3, Math.min(100 - selectedZone.left, Number((selectedZone.width + dw).toFixed(2))));
    const newHeight = Math.max(3, Math.min(100 - selectedZone.top, Number((selectedZone.height + dh).toFixed(2))));
    updateZone(selectedZone.id, { width: newWidth, height: newHeight });
  }, [selectedZone, updateZone]);

  // Batch align building piles
  const alignBuildings = useCallback(() => {
    const b0 = zones.building_0;
    if (!b0) return;
    const targetTop = b0.top;
    const targetHeight = b0.height;
    const targetWidth = b0.width;

    setZones(prev => {
      const copy = { ...prev };
      // 4 building slots distributed starting at 5.79%
      const startX = 5.79;
      const gap = 10.53;
      ['building_0', 'building_1', 'building_2', 'building_3'].forEach((id, idx) => {
        if (copy[id]) {
          copy[id] = {
            ...copy[id],
            top: targetTop,
            height: targetHeight,
            width: targetWidth,
            left: Number((startX + idx * gap).toFixed(2)),
          };
        }
      });
      return copy;
    });
  }, [zones]);

  // Batch align civilization cards
  const alignCards = useCallback(() => {
    const c3 = zones.card_3;
    if (!c3) return;
    const targetTop = c3.top;
    const targetHeight = c3.height;
    const targetWidth = c3.width;

    setZones(prev => {
      const copy = { ...prev };
      const startX = 51.45;
      const gap = 10.66;
      ['card_3', 'card_2', 'card_1', 'card_0'].forEach((id, idx) => {
        if (copy[id]) {
          copy[id] = {
            ...copy[id],
            top: targetTop,
            height: targetHeight,
            width: targetWidth,
            left: Number((startX + idx * gap).toFixed(2)),
          };
        }
      });
      return copy;
    });
  }, [zones]);

  // Pointer drag & resize handlers
  const handlePointerDown = (e: React.PointerEvent, zoneId: string, mode: DragMode) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(zoneId);

    const targetZone = zones[zoneId];
    if (!targetZone) return;

    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: targetZone.left,
      initialTop: targetZone.top,
      initialWidth: targetZone.width,
      initialHeight: targetZone.height,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current.mode || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const boardW = rect.width;
      const boardH = rect.height;
      if (boardW <= 0 || boardH <= 0) return;

      const deltaXPct = ((moveEvent.clientX - dragRef.current.startX) / boardW) * 100;
      const deltaYPct = ((moveEvent.clientY - dragRef.current.startY) / boardH) * 100;

      const { mode: currentMode, initialLeft, initialTop, initialWidth, initialHeight } = dragRef.current;

      let newLeft = initialLeft;
      let newTop = initialTop;
      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (currentMode === 'move') {
        newLeft = Math.max(0, Math.min(100 - initialWidth, initialLeft + deltaXPct));
        newTop = Math.max(0, Math.min(100 - initialHeight, initialTop + deltaYPct));
      } else {
        // Resize logic
        if (currentMode?.includes('e')) {
          newWidth = Math.max(3, Math.min(100 - initialLeft, initialWidth + deltaXPct));
        }
        if (currentMode?.includes('s')) {
          newHeight = Math.max(3, Math.min(100 - initialTop, initialHeight + deltaYPct));
        }
        if (currentMode?.includes('w')) {
          const maxLeftShift = initialWidth - 3;
          const shift = Math.max(-initialLeft, Math.min(maxLeftShift, deltaXPct));
          newLeft = initialLeft + shift;
          newWidth = initialWidth - shift;
        }
        if (currentMode?.includes('n')) {
          const maxTopShift = initialHeight - 3;
          const shift = Math.max(-initialTop, Math.min(maxTopShift, deltaYPct));
          newTop = initialTop + shift;
          newHeight = initialHeight - shift;
        }
      }

      setZones(prev => ({
        ...prev,
        [zoneId]: {
          ...prev[zoneId],
          left: Number(newLeft.toFixed(2)),
          top: Number(newTop.toFixed(2)),
          width: Number(newWidth.toFixed(2)),
          height: Number(newHeight.toFixed(2)),
        },
      }));
    };

    const handlePointerUp = () => {
      dragRef.current.mode = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Save to localStorage & apply
  const handleSaveAndApply = () => {
    saveClassicZones(zones);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    if (onApplied) onApplied();
  };

  // Reset to factory defaults
  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les zones aux valeurs par défaut étalonnées ?')) {
      const def = resetClassicZones();
      setZones(def);
      if (onApplied) onApplied();
    }
  };

  // Copy code snippet
  const handleCopyCode = () => {
    const formatted = JSON.stringify(zones, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  // Filtered zone list for sidebar
  const zoneList = Object.values(zones).filter(z => {
    if (activeCategory === 'all') return true;
    return z.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="h-14 sm:h-16 bg-stone-900 border-b border-stone-800 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-amber-200 flex items-center gap-2">
              <span>Éditeur Interactif des Zones (Plateau Original 2008)</span>
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                Mode Glisser-Déposer
              </span>
            </h2>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Cliquez et déplacez directement les zones sur le plateau. Utilisez les poignées blanches pour ajuster la taille.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Meeples Preview */}
          <button
            onClick={() => setShowMeeplesPreview(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showMeeplesPreview 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
            title="Afficher/masquer les ouvriers d'exemple dans les zones"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Aperçu ouvriers</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Rétablir les coordonnées d'étalonnage par défaut"
          >
            <RotateCcw className="w-4 h-4 text-stone-400" />
            <span className="hidden md:inline">Par défaut</span>
          </button>

          {/* Code / JSON */}
          <button
            onClick={() => setShowCodeModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Voir et copier le JSON / code des coordonnées"
          >
            <Copy className="w-4 h-4 text-stone-400" />
            <span className="hidden md:inline">Exporter code</span>
          </button>

          {/* Save & Apply */}
          <button
            onClick={handleSaveAndApply}
            className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-[0_2px_12px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Enregistrer et appliquer directement au jeu"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-stone-950" /> : <Save className="w-4 h-4 text-stone-950" />}
            <span>{saveSuccess ? 'Appliqué !' : 'Enregistrer & Appliquer'}</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer border border-stone-700 ml-1"
            title="Fermer l'éditeur"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY (SPLIT: BOARD VIEWPORT & CONTROLS DOCK) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* CENTER / LEFT: INTERACTIVE CANVAS WITH BOARD.JPG */}
        <div className="flex-1 relative overflow-auto flex items-center justify-center p-2 sm:p-4 bg-stone-950">
          <div 
            ref={boardRef}
            className="relative shadow-2xl rounded-lg overflow-hidden border border-stone-800 max-w-full max-h-full"
            style={{
              aspectRatio: '760 / 531',
              width: 'min(100%, calc((100vh - 180px) * 760 / 531))',
            }}
          >
            {/* Background Original Board 2008 Artwork */}
            <img 
              src="/board.jpg" 
              alt="Plateau Original Âge de Pierre 2008"
              className="w-full h-full object-fill pointer-events-none filter contrast-[1.02]"
              draggable={false}
            />

            {/* Overlaid Interactive Zones */}
            {Object.values(zones).map(zone => {
              const isSelected = zone.id === selectedId;
              const { left, top, width, height, color, name, sublabel } = zone;
              const centerX = left + width / 2;
              const centerY = top + height / 2;

              return (
                <div
                  key={zone.id}
                  onPointerDown={(e) => handlePointerDown(e, zone.id, 'move')}
                  className={`absolute transition-colors group cursor-move select-none ${
                    isSelected 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-950 shadow-2xl z-30' 
                      : 'hover:ring-1 hover:ring-white/80 z-10'
                  }`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    backgroundColor: isSelected ? `${color}35` : `${color}18`,
                    border: `2px solid ${isSelected ? '#ffffff' : color}`,
                    borderRadius: '6px',
                  }}
                >
                  {/* Zone Header Label Badge */}
                  <div 
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black pointer-events-none flex items-center gap-1 shadow-md truncate max-w-[95%]"
                    style={{
                      backgroundColor: isSelected ? '#000000ee' : '#000000cc',
                      color: isSelected ? '#ffffff' : '#f1f5f9',
                      border: `1px solid ${isSelected ? '#ffffff' : color}`,
                    }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: color }} 
                    />
                    <span className="truncate">{name}</span>
                  </div>

                  {/* Center Target Anchor Dot */}
                  <div 
                    className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full shadow"
                      style={{ backgroundColor: isSelected ? '#ffffff' : color }}
                    />
                    <div className="absolute w-4 h-4 rounded-full border border-white/60 pointer-events-none" />
                  </div>

                  {/* Sample Meeples Preview */}
                  {showMeeplesPreview && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none pt-4 opacity-80">
                      {zone.id === 'hut' ? (
                        <>
                          <MeepleIcon color="red" size={16} />
                          <MeepleIcon color="red" size={16} />
                        </>
                      ) : zone.id.startsWith('building_') ? (
                        <MeepleIcon color="blue" size={16} />
                      ) : zone.id.startsWith('card_') ? (
                        <MeepleIcon color="green" size={16} />
                      ) : (
                        <MeepleIcon color="yellow" size={16} />
                      )}
                    </div>
                  )}

                  {/* 8 RESIZE HANDLES FOR THE SELECTED ZONE */}
                  {isSelected && (
                    <>
                      {/* Top-Left */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Top */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'n')}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-ns-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Top-Right */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Right */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'e')}
                        className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-ew-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Bottom-Right */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Bottom */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 's')}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-ns-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Bottom-Left */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                      />
                      {/* Left */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, zone.id, 'w')}
                        className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-stone-900 rounded-sm cursor-ew-resize z-40 hover:scale-125 transition-transform"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT / BOTTOM: CONTROL PANEL FOR FINE ADJUSTMENTS */}
        <aside className="w-full lg:w-96 bg-stone-900/95 border-t lg:border-t-0 lg:border-l border-stone-800 p-3 sm:p-4 flex flex-col gap-3 shrink-0 overflow-y-auto max-h-[45vh] lg:max-h-full">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-stone-800 text-[11px]">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'resources', label: 'Ressources' },
              { id: 'village', label: 'Village' },
              { id: 'buildings', label: 'Bâtiments' },
              { id: 'cards', label: 'Cartes' },
              { id: 'expansions', label: 'Extensions' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Zone Selector Dropdown */}
          <div>
            <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Zone sélectionnée :
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs font-black focus:outline-none focus:border-amber-500"
            >
              {zoneList.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.sublabel})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Zone Card */}
          {selectedZone && (
            <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: selectedZone.color }}
                  />
                  <span className="font-black text-amber-200 text-xs sm:text-sm">
                    {selectedZone.name}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono bg-stone-900 px-2 py-0.5 rounded">
                  {selectedZone.id}
                </span>
              </div>

              {/* Direct Coordinate Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5 font-bold">X (Gauche %) :</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={selectedZone.left}
                    onChange={(e) => updateZone(selectedZone.id, { left: Number(parseFloat(e.target.value) || 0) })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100 font-mono font-bold focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5 font-bold">Y (Haut %) :</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={selectedZone.top}
                    onChange={(e) => updateZone(selectedZone.id, { top: Number(parseFloat(e.target.value) || 0) })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100 font-mono font-bold focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5 font-bold">Largeur (%) :</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={selectedZone.width}
                    onChange={(e) => updateZone(selectedZone.id, { width: Number(parseFloat(e.target.value) || 1) })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100 font-mono font-bold focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 block mb-0.5 font-bold">Hauteur (%) :</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={selectedZone.height}
                    onChange={(e) => updateZone(selectedZone.id, { height: Number(parseFloat(e.target.value) || 1) })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-stone-100 font-mono font-bold focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Calculated Centers */}
              <div className="flex items-center justify-between text-[11px] bg-stone-900/60 p-2 rounded-xl text-stone-300 font-mono">
                <span>Centre X : <strong className="text-amber-400">{(selectedZone.left + selectedZone.width / 2).toFixed(2)}%</strong></span>
                <span>Centre Y : <strong className="text-amber-400">{(selectedZone.top + selectedZone.height / 2).toFixed(2)}%</strong></span>
              </div>

              {/* Quick Nudge Buttons (Pad) */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1.5">
                  Déplacement fin (±0.5%) :
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => nudge(-0.5, 0)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95"
                    title="Déplacer vers la gauche (-0.5%)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => nudge(0, -0.5)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95"
                      title="Déplacer vers le haut (-0.5%)"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => nudge(0, 0.5)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95"
                      title="Déplacer vers le bas (+0.5%)"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => nudge(0.5, 0)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-all cursor-pointer active:scale-95"
                    title="Déplacer vers la droite (+0.5%)"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Size adjustments */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1.5">
                  Ajuster dimensions (±0.5%) :
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => adjustSize(-0.5, 0)}
                    className="py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer"
                  >
                    W -
                  </button>
                  <button
                    onClick={() => adjustSize(0.5, 0)}
                    className="py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer"
                  >
                    W +
                  </button>
                  <button
                    onClick={() => adjustSize(0, -0.5)}
                    className="py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer"
                  >
                    H -
                  </button>
                  <button
                    onClick={() => adjustSize(0, 0.5)}
                    className="py-1 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer"
                  >
                    H +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Alignment Tools */}
          <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Outils d'alignement rapide :
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={alignBuildings}
                className="w-full py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
              >
                <span>🏢 Aligner les 4 Piles Bâtiments</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button
                onClick={alignCards}
                className="w-full py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-300 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
              >
                <span>📜 Aligner les 4 Cartes Civilisation</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL: EXPORT CODE / JSON */}
      {showCodeModal && (
        <div 
          className="fixed inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
          onClick={() => setShowCodeModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-stone-900 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-3 max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Copy className="w-4 h-4" />
                <span>Exportation des Coordonnées (JSON)</span>
              </h3>
              <button 
                onClick={() => setShowCodeModal(false)}
                className="p-1 rounded-full bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Voici la structure JSON exacte de vos zones personnalisées. Vous pouvez la copier pour l'intégrer au projet ou la sauvegarder.
            </p>

            <pre className="flex-1 overflow-auto bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] font-mono text-emerald-300">
              {JSON.stringify(zones, null, 2)}
            </pre>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copié dans le presse-papier !' : 'Copier le JSON'}</span>
              </button>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
