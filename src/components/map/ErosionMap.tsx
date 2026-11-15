"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ErosionFeatureCollection,
  ErosionFeatureProperties,
  LayerFilterState,
  SeverityClass,
} from "@/types/erosion";
import {
  EROSION_SEVERITY_CONFIG,
  KABARE_GEO_CONFIG,
  getSeverityRule,
} from "@/config/erosionRules";
import { discussionService } from "@/services/discussionService";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Layers,
  Loader2,
  ChevronDown,
  Key,
  Mountain,
  Map as MapIcon,
  Satellite,
  Info,
  Sparkles,
} from "lucide-react";

interface ErosionMapProps {
  dataset: ErosionFeatureCollection | null;
  loading: boolean;
  filterState: LayerFilterState;
  onSelectZone: (properties: ErosionFeatureProperties) => void;
  selectedProperties: ErosionFeatureProperties | null;
  resetViewTrigger: number;
  focusedZoneId: number | null;
  mapboxToken: string;
  cartoApiKey: string;
  onOpenApiKeyModal: () => void;
  observationVersion?: number;
}

type BasemapType =
  | "mapboxOutdoors"
  | "mapboxSatellite"
  | "mapboxDark"
  | "esriTopo"
  | "osm"
  | "satellite";

export function ErosionMap({
  dataset,
  loading,
  filterState,
  onSelectZone,
  selectedProperties,
  resetViewTrigger,
  focusedZoneId,
  mapboxToken,
  onOpenApiKeyModal,
  observationVersion = 0,
}: ErosionMapProps) {
  const { t } = useLocale();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeBasemap, setActiveBasemap] = useState<BasemapType>(
    mapboxToken ? "mapboxOutdoors" : "esriTopo"
  );
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Set Mapbox default when token exists
  useEffect(() => {
    if (mapboxToken && (activeBasemap === "esriTopo" || activeBasemap === "osm")) {
      setActiveBasemap("mapboxOutdoors");
    }
  }, [mapboxToken]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: KABARE_GEO_CONFIG.defaultCenter,
      zoom: KABARE_GEO_CONFIG.defaultZoom,
      minZoom: KABARE_GEO_CONFIG.minZoom,
      maxZoom: KABARE_GEO_CONFIG.maxZoom,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const initialUrl = mapboxToken
      ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

    const tile = L.tileLayer(initialUrl, {
      attribution: mapboxToken ? "Mapbox" : "Esri",
      maxZoom: 19,
    }).addTo(map);

    basemapLayerRef.current = tile;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Basemap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
    }

    let url = "";
    let attribution = "";

    if (activeBasemap === "mapboxOutdoors" && mapboxToken) {
      url = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
      attribution = "Mapbox";
    } else if (activeBasemap === "mapboxSatellite" && mapboxToken) {
      url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
      attribution = "Mapbox";
    } else if (activeBasemap === "mapboxDark" && mapboxToken) {
      url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
      attribution = "Mapbox";
    } else if (activeBasemap === "esriTopo") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
      attribution = "Esri Topo";
    } else if (activeBasemap === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Esri Satellite";
    } else {
      url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = "OpenStreetMap";
    }

    const newLayer = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(map);
    basemapLayerRef.current = newLayer;

    if (geoJsonLayerRef.current) geoJsonLayerRef.current.bringToFront();
    if (markersLayerRef.current) {
      markersLayerRef.current.eachLayer((l: any) => {
        if (l.bringToFront) l.bringToFront();
      });
    }
  }, [activeBasemap, mapboxToken]);

  // Render Polygons and Discussion Badges
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !dataset) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const observedZones = discussionService.getObservedZoneIds();
    const canvasRenderer = L.canvas({ padding: 0.5 });

    const layer = L.geoJSON(dataset as any, {
      filter: (feature) => {
        const gridcode = feature.properties?.gridcode as SeverityClass;
        const norm = Math.max(1, Math.min(4, Math.round(gridcode || 1))) as SeverityClass;
        return Boolean(filterState.visibleClasses[norm]);
      },
      style: (feature) => {
        if (!feature) return {};
        const rule = getSeverityRule(feature.properties.gridcode);
        const isSelected = selectedProperties?.id === feature.properties.id;
        const hasDiscussion = observedZones.has(feature.properties.id);

        return {
          renderer: canvasRenderer,
          fillColor: rule.color,
          fillOpacity: isSelected ? 0.95 : filterState.opacity * (rule.fillOpacity || 0.7),
          color: isSelected ? "#38bdf8" : hasDiscussion ? "#38bdf8" : rule.borderColor,
          weight: isSelected ? 3 : hasDiscussion ? 2 : 0.8,
          opacity: 1,
        };
      },
      onEachFeature: (feature, featureLayer: any) => {
        const props = feature.properties as ErosionFeatureProperties;
        const rule = getSeverityRule(props.gridcode);
        const obs = discussionService.getObservationsForZone(props.id);
        const discussionNote =
          obs.length > 0
            ? `<div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.2);color:#38bdf8;font-weight:600;">[Observation terrain: ${obs.length} note(s)]</div>`
            : "";

        featureLayer.bindTooltip(
          `<strong>Zone #${props.id}</strong><br/>` +
            `Sévérité: ${t(rule.nameKey)} (Classe ${props.gridcode})<br/>` +
            `Superficie: ${props.area_ha.toLocaleString()} ha` +
            discussionNote,
          { sticky: true, className: "custom-map-tooltip" }
        );

        featureLayer.on({
          click: () => onSelectZone(props),
          mouseover: (e: any) => {
            if (selectedProperties?.id !== props.id) {
              e.target.setStyle({ weight: 2, color: "#f8fafc" });
            }
          },
          mouseout: (e: any) => {
            if (selectedProperties?.id !== props.id) {
              const hasObs = observedZones.has(props.id);
              e.target.setStyle({
                weight: hasObs ? 2 : 0.8,
                color: hasObs ? "#38bdf8" : rule.borderColor,
              });
            }
          },
        });

        // Add public field marker badge if zone has discussions
        if (obs.length > 0 && markersLayerRef.current && featureLayer.getBounds) {
          try {
            const center = featureLayer.getBounds().getCenter();
            const icon = L.divIcon({
              className: "discussion-marker-container",
              html: `<div style="background:#0f172a;color:#38bdf8;border:1px solid #38bdf8;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.6);white-space:nowrap;cursor:pointer;">#${props.id} (${obs.length})</div>`,
              iconSize: [40, 20],
              iconAnchor: [20, 10],
            });
            const marker = L.marker(center, { icon });
            marker.on("click", () => onSelectZone(props));
            markersLayerRef.current.addLayer(marker);
          } catch (e) {}
        }
      },
    });

    layer.addTo(map);
    geoJsonLayerRef.current = layer;

    if (dataset.features.length > 0 && !selectedProperties) {
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
      } catch (err) {
        map.setView(KABARE_GEO_CONFIG.defaultCenter, KABARE_GEO_CONFIG.defaultZoom);
      }
    }
  }, [dataset, filterState.visibleClasses, filterState.opacity, selectedProperties, observationVersion]);

  // Reset View
  useEffect(() => {
    if (resetViewTrigger === 0) return;
    const map = mapInstanceRef.current;
    const layer = geoJsonLayerRef.current;
    if (!map) return;
    if (layer && layer.getBounds().isValid()) {
      map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 13 });
    } else {
      map.setView(KABARE_GEO_CONFIG.defaultCenter, KABARE_GEO_CONFIG.defaultZoom);
    }
  }, [resetViewTrigger]);

  // Focus specific Zone
  useEffect(() => {
    if (!focusedZoneId || !geoJsonLayerRef.current || !mapInstanceRef.current) return;
    const layer = geoJsonLayerRef.current;
    layer.eachLayer((subLayer: any) => {
      if (subLayer.feature?.properties?.id === focusedZoneId && subLayer.getBounds) {
        mapInstanceRef.current?.fitBounds(subLayer.getBounds(), { padding: [60, 60], maxZoom: 15 });
      }
    });
  }, [focusedZoneId]);

  const basemapOptions = useMemo(
    () => [
      ...(mapboxToken
        ? [
            { id: "mapboxOutdoors", label: "Mapbox Outdoors", sub: "Relief & courbes de niveau", icon: Mountain },
            { id: "mapboxSatellite", label: "Mapbox Satellite", sub: "Imagerie HD avec rues", icon: Satellite },
            { id: "mapboxDark", label: "Mapbox Dark GIS", sub: "Contraste sombre élevé", icon: Sparkles },
          ]
        : []),
      { id: "esriTopo", label: "Esri Topo", sub: "Relief montagneux (Gratuit)", icon: Mountain },
      { id: "osm", label: "OpenStreetMap", sub: "Standard OSM (Gratuit)", icon: MapIcon },
      { id: "satellite", label: "Esri Satellite", sub: "Image satellite (Gratuit)", icon: Satellite },
    ],
    [mapboxToken]
  );

  return (
    <div className="relative w-full h-full flex-1 min-h-0 bg-slate-950 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">{t("mapControls.loadingDataset")}</span>
          </div>
        </div>
      )}

      {/* Basemap Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowBasemapMenu(!showBasemapMenu)}
          className="px-3 py-2 bg-slate-900/95 text-slate-200 border border-slate-800 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium hover:bg-slate-850"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="capitalize">{activeBasemap.replace("mapbox", "Mapbox ")}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showBasemapMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800">
              {t("mapControls.basemapTitle")}
            </div>
            {basemapOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActiveBasemap(opt.id as BasemapType);
                    setShowBasemapMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-800 ${
                    activeBasemap === opt.id ? "text-emerald-400 font-semibold bg-emerald-500/10" : "text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <div>{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.sub}</div>
                  </div>
                </button>
              );
            })}
            <div className="p-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowBasemapMenu(false);
                  onOpenApiKeyModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-emerald-400 hover:bg-slate-800 rounded"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Gérer Token Mapbox</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Legend */}
      <div className="absolute bottom-6 left-4 z-20 bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-xl hidden sm:block w-64">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            {t("mapControls.legend")}
          </span>
          <button onClick={() => setLegendCollapsed(!legendCollapsed)} className="text-[11px] text-slate-400">
            {legendCollapsed ? "Ouvrir" : "Fermer"}
          </button>
        </div>
        {!legendCollapsed && (
          <div className="space-y-1.5 text-xs">
            {([1, 2, 3, 4] as SeverityClass[]).map((cls) => {
              const rule = EROSION_SEVERITY_CONFIG[cls];
              return (
                <div key={cls} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rule.color }} />
                    <span className="text-slate-300">{t(rule.nameKey)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{rule.lossRangeTonsPerHaYear}</span>
                </div>
              );
            })}
            <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2 text-[11px] text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Bordure bleue : Constats terrain</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
