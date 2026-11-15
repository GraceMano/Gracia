"use client";

import dynamic from "next/dynamic";
import React from "react";
import {
  ErosionFeatureCollection,
  ErosionFeatureProperties,
  LayerFilterState,
} from "@/types/erosion";

interface MapContainerProps {
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

const DynamicErosionMap = dynamic(
  () => import("./ErosionMap").then((mod) => mod.ErosionMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex-1 flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Chargement de la carte interactive...
      </div>
    ),
  }
);

export function MapContainer(props: MapContainerProps) {
  return <DynamicErosionMap {...props} />;
}
