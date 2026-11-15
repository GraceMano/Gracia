"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ErosionFeatureCollection,
  ErosionFeatureProperties,
  TerritoryStatistics,
  LayerFilterState,
  SeverityClass,
} from "@/types/erosion";
import { geoService } from "@/services/geoService";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MapContainer } from "@/components/map/MapContainer";
import { ApiKeyModal } from "@/components/common/ApiKeyModal";

export default function Home() {
  const [dataset, setDataset] = useState<ErosionFeatureCollection | null>(null);
  const [stats, setStats] = useState<TerritoryStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProperties, setSelectedProperties] =
    useState<ErosionFeatureProperties | null>(null);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [focusedZoneId, setFocusedZoneId] = useState<number | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(
    (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "").trim()
  );
  const [cartoApiKey, setCartoApiKey] = useState<string>(
    (process.env.NEXT_PUBLIC_CARTO_API_KEY || "").trim()
  );
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [observationVersion, setObservationVersion] = useState(0);

  const handleObservationAdded = useCallback(() => {
    setObservationVersion((v) => v + 1);
  }, []);

  // Load tokens from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMapbox = localStorage.getItem("kabare_mapbox_token");
      if (savedMapbox) {
        setMapboxToken(savedMapbox);
      }
      const savedCarto = localStorage.getItem("kabare_carto_api_key");
      if (savedCarto) {
        setCartoApiKey(savedCarto);
      }
    }
  }, []);

  const handleSaveMapboxToken = useCallback((token: string) => {
    setMapboxToken(token);
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("kabare_mapbox_token", token);
      } else {
        localStorage.removeItem("kabare_mapbox_token");
      }
    }
  }, []);

  const handleSaveCartoKey = useCallback((key: string) => {
    setCartoApiKey(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("kabare_carto_api_key", key);
      } else {
        localStorage.removeItem("kabare_carto_api_key");
      }
    }
  }, []);

  const [filterState, setFilterState] = useState<LayerFilterState>({
    visibleClasses: {
      1: true,
      2: true,
      3: true,
      4: true,
    },
    opacity: 0.7,
    highlightedZoneId: null,
    selectedZoneId: null,
  });

  // Load dataset on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const data = await geoService.loadErosionDataset();
        if (isMounted) {
          setDataset(data);
          const computedStats = geoService.calculateTerritoryStats(data);
          setStats(computedStats);
        }
      } catch (err) {
        console.error("Failed to load geospatial data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleClass = useCallback((classId: SeverityClass) => {
    setFilterState((prev) => ({
      ...prev,
      visibleClasses: {
        ...prev.visibleClasses,
        [classId]: !prev.visibleClasses[classId],
      },
    }));
  }, []);

  const handleSetOpacity = useCallback((opacity: number) => {
    setFilterState((prev) => ({
      ...prev,
      opacity,
    }));
  }, []);

  const handleShowAll = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      visibleClasses: { 1: true, 2: true, 3: true, 4: true },
    }));
  }, []);

  const handleHideAll = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      visibleClasses: { 1: false, 2: false, 3: false, 4: false },
    }));
  }, []);

  const handleSelectZone = useCallback(
    (properties: ErosionFeatureProperties) => {
      setSelectedProperties(properties);
      setFocusedZoneId(properties.id);
      setSidebarOpen(true);
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedProperties(null);
    setFocusedZoneId(null);
  }, []);

  const handleSearchZone = useCallback(
    (id: number): boolean => {
      if (!dataset) return false;
      const target = geoService.getZoneById(dataset, id);
      if (target) {
        setSelectedProperties(target.properties);
        setFocusedZoneId(target.properties.id);
        const normalized = Math.max(
          1,
          Math.min(4, Math.round(target.properties.gridcode || 1))
        ) as SeverityClass;
        setFilterState((prev) => ({
          ...prev,
          visibleClasses: {
            ...prev.visibleClasses,
            [normalized]: true,
          },
        }));
        setSidebarOpen(true);
        return true;
      }
      return false;
    },
    [dataset]
  );

  const handleResetView = useCallback(() => {
    setResetViewTrigger((prev) => prev + 1);
    setSelectedProperties(null);
    setFocusedZoneId(null);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onResetView={handleResetView}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        totalPolygons={stats?.totalPolygons}
        totalAreaHa={stats?.totalAreaHa}
      />

      <main className="flex-1 flex relative overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          stats={stats}
          selectedProperties={selectedProperties}
          onClearSelection={handleClearSelection}
          filterState={filterState}
          onToggleClass={handleToggleClass}
          onSetOpacity={handleSetOpacity}
          onSearchZone={handleSearchZone}
          onShowAll={handleShowAll}
          onHideAll={handleHideAll}
          loading={loading}
          onObservationAdded={handleObservationAdded}
        />

        <MapContainer
          dataset={dataset}
          loading={loading}
          filterState={filterState}
          onSelectZone={handleSelectZone}
          selectedProperties={selectedProperties}
          resetViewTrigger={resetViewTrigger}
          focusedZoneId={focusedZoneId}
          mapboxToken={mapboxToken}
          cartoApiKey={cartoApiKey}
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          observationVersion={observationVersion}
        />
      </main>

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        mapboxToken={mapboxToken}
        onSaveMapboxToken={handleSaveMapboxToken}
        cartoApiKey={cartoApiKey}
        onSaveCartoKey={handleSaveCartoKey}
      />
    </div>
  );
}
