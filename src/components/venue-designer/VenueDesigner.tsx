'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import GridCanvas from './components/GridCanvas';
import FurniturePalette from './components/FurniturePalette';
import DimensionSettings from './components/DimensionSettings';
import PropertiesSidebar from './components/PropertiesSidebar';
import type { FurnitureTemplate, FurnitureItem } from './types/furniture';
import { supabase } from './lib/supabase';

interface VenueDesignerProps {
  eventId: string;
}

function formatDimension(feet: number): string {
  const wholeF = Math.floor(feet);
  const inches = Math.round((feet - wholeF) * 12);
  if (inches === 0) return `${wholeF}'`;
  return `${wholeF}'${inches}"`;
}

export default function VenueDesigner({ eventId }: VenueDesignerProps) {
  const [floorPlan, setFloorPlan] = useState<{
    id: string;
    width: number;
    height: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draggedTemplate, setDraggedTemplate] = useState<FurnitureTemplate | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [placementMode, setPlacementMode] = useState<
    'none' | 'single' | 'row' | 'custom-row' | 'multi-row' | 'marquee'
  >('none');
  const [rowChairCount, setRowChairCount] = useState<number | null>(null);
  const [sidebarSelectedItem, setSidebarSelectedItem] = useState<FurnitureItem | null>(null);
  const [sidebarGroupItems, setSidebarGroupItems] = useState<FurnitureItem[]>([]);
  const [furnitureRefreshKey, setFurnitureRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string | null>(null);
  const [multiSelectedRowItems, setMultiSelectedRowItems] = useState<FurnitureItem[]>([]);
  const [multiSelectedAllItems, setMultiSelectedAllItems] = useState<FurnitureItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        setLoadError('You must be signed in to design a floor plan.');
        return;
      }

      const { data: existingRows, error: fetchError } = await supabase
        .from('floor_plans')
        .select('id, width, height, created_at')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);
      if (fetchError) {
        setLoadError(fetchError.message);
        return;
      }

      const existing = existingRows?.[0];
      if (existing) {
        if (!cancelled) {
          setFloorPlan({ id: existing.id, width: Number(existing.width), height: Number(existing.height) });
        }
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from('floor_plans')
        .insert({
          event_id: eventId,
          user_id: userId,
          width: 90,
          height: 90,
          name: "Floor Plan 90' \u00D7 90'",
        })
        .select('id, width, height')
        .maybeSingle();

      if (insertError) {
        const { data: raceRows } = await supabase
          .from('floor_plans')
          .select('id, width, height, created_at')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(1);
        const race = raceRows?.[0];
        if (race && !cancelled) {
          setFloorPlan({ id: race.id, width: Number(race.width), height: Number(race.height) });
          return;
        }
        setLoadError(insertError.message);
        return;
      }

      if (!created) {
        setLoadError('Could not create floor plan.');
        return;
      }
      if (!cancelled) {
        setFloorPlan({ id: created.id, width: Number(created.width), height: Number(created.height) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleFurnitureDragStart = (template: FurnitureTemplate) => {
    setDraggedTemplate(template);
  };

  const handleActivatePlacementMode = (
    mode: 'single' | 'row' | 'custom-row' | 'multi-row' | 'marquee',
    chairCount?: number
  ) => {
    setPlacementMode(mode);
    setRowChairCount(chairCount ?? null);
  };

  const handleDeactivatePlacementMode = () => {
    setPlacementMode('none');
    setRowChairCount(null);
  };

  const handleSelectionChange = useCallback(
    (
      selectedItem: FurnitureItem | null,
      groupItems: FurnitureItem[],
      itemSelectedId: string | null,
      itemSelectedIndividualId: string | null
    ) => {
      setSelectedId(itemSelectedId);
      setSelectedIndividualId(itemSelectedIndividualId);
      if (selectedItem && (selectedItem.type === 'row' || selectedItem.type === 'table')) {
        setSidebarSelectedItem(selectedItem);
        setSidebarGroupItems(groupItems);
      } else {
        setSidebarSelectedItem(null);
        setSidebarGroupItems([]);
      }
    },
    []
  );

  const handleMultiSelectionChange = useCallback(
    (rowItems: FurnitureItem[], allItems: FurnitureItem[]) => {
      setMultiSelectedRowItems(rowItems);
      setMultiSelectedAllItems(allItems);
      setSidebarSelectedItem(null);
      setSidebarGroupItems([]);
    },
    []
  );

  const handleClearSelection = () => {
    setSelectedId(null);
    setSelectedIndividualId(null);
    setSidebarSelectedItem(null);
    setSidebarGroupItems([]);
    setMultiSelectedRowItems([]);
    setMultiSelectedAllItems([]);
  };

  const handleSidebarUpdate = () => {
    setFurnitureRefreshKey((prev) => prev + 1);
  };

  const handleDimensionUpdate = async (width: number, height: number) => {
    if (!floorPlan) return;

    const { error } = await supabase
      .from('floor_plans')
      .update({
        width,
        height,
        name: `Floor Plan ${formatDimension(width)} \u00D7 ${formatDimension(height)}`,
      })
      .eq('id', floorPlan.id);
    if (error) {
      console.error('Error updating floor plan:', error);
      return;
    }

    const { data: furnitureItems } = await supabase
      .from('furniture_items')
      .select('*')
      .eq('floor_plan_id', floorPlan.id);

    if (furnitureItems) {
      for (const item of furnitureItems) {
        const newX = Math.max(0, Math.min(item.x, width - item.width));
        const newY = Math.max(0, Math.min(item.y, height - item.height));
        if (newX !== item.x || newY !== item.y) {
          await supabase.from('furniture_items').update({ x: newX, y: newY }).eq('id', item.id);
        }
      }
    }

    setFloorPlan({ ...floorPlan, width, height });
  };

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-sm text-red-600">{loadError}</div>
      </div>
    );
  }

  if (!floorPlan) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading floor plan...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-800">Floor Plan Designer</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition whitespace-nowrap"
        >
          <Settings className="w-3.5 h-3.5" />
          Dimensions
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden min-h-0">
        <FurniturePalette
          onDragStart={handleFurnitureDragStart}
          onActivatePlacementMode={handleActivatePlacementMode}
          onDeactivatePlacementMode={handleDeactivatePlacementMode}
          placementMode={placementMode}
          rowChairCount={rowChairCount}
        />
        <div className="flex-1 overflow-hidden min-w-0">
          <GridCanvas
            width={floorPlan.width}
            height={floorPlan.height}
            refreshKey={furnitureRefreshKey}
            floorPlanId={floorPlan.id}
            draggedTemplate={draggedTemplate}
            onTemplatePlaced={() => setDraggedTemplate(null)}
            placementMode={placementMode}
            rowChairCount={rowChairCount}
            onDeactivatePlacementMode={handleDeactivatePlacementMode}
            onSelectionChange={handleSelectionChange}
            onMultiSelectionChange={handleMultiSelectionChange}
            selectedId={selectedId}
            selectedIndividualId={selectedIndividualId}
            onClearSelection={handleClearSelection}
          />
        </div>
        {(sidebarSelectedItem || multiSelectedRowItems.length > 0) && (
          <PropertiesSidebar
            selectedItem={sidebarSelectedItem}
            groupItems={sidebarGroupItems}
            multiSelectedRowItems={multiSelectedRowItems}
            multiSelectedAllItems={multiSelectedAllItems}
            onClose={handleClearSelection}
            onUpdate={handleSidebarUpdate}
          />
        )}
      </div>
      {showSettings && (
        <DimensionSettings
          currentWidth={floorPlan.width}
          currentHeight={floorPlan.height}
          onUpdate={handleDimensionUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
