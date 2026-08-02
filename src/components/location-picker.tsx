"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";

type Props = {
  lat: number | null;
  lng: number | null;
  mapLink: string;
  onPinChange: (lat: number, lng: number) => void;
  onLinkChange: (link: string) => void;
};

// A small colored pin, drawn as a div icon so we never depend on Leaflet's
// default marker image assets (a well-known bundler footgun).
function pinIcon(L: typeof Leaflet) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:linear-gradient(135deg,#f97316,#ea580c);
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,.35);
      border:2px solid white;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export function LocationPicker({ lat, lng, mapLink, onPinChange, onLinkChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const start = lat != null && lng != null ? { lat, lng } : DEFAULT_MAP_CENTER;
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom: lat != null ? 15 : 11,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const icon = pinIcon(L);

      function placeMarker(lt: number, lg: number) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lt, lg]);
        } else {
          markerRef.current = L.marker([lt, lg], { icon, draggable: true }).addTo(map!);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onPinChange(pos.lat, pos.lng);
          });
        }
      }

      if (lat != null && lng != null) {
        placeMarker(lat, lng);
      }

      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
        onPinChange(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        onPinChange(latitude, longitude);
        mapRef.current?.setView([latitude, longitude], 16);
        import("leaflet").then((L) => {
          const icon = pinIcon(L);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else if (mapRef.current) {
            markerRef.current = L.marker([latitude, longitude], { icon, draggable: true }).addTo(
              mapRef.current
            );
            markerRef.current.on("dragend", () => {
              const pos2 = markerRef.current!.getLatLng();
              onPinChange(pos2.lat, pos2.lng);
            });
          }
        });
      },
      () => {
        setLocating(false);
        setLocateError("Couldn't get your location — you can still drop a pin manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Pin your location</span>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-60"
        >
          {locating ? "Locating…" : "📍 Use my location"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner"
      />

      {locateError && <p className="mt-1 text-xs text-amber-600">{locateError}</p>}

      <p className="mt-2 text-xs text-slate-500">
        Tap the map to drop a pin, or drag it to fine-tune. {lat != null && lng != null && (
          <span className="font-medium text-slate-700">
            Pinned at {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        )}
      </p>

      <div className="mt-3">
        <label className="block text-xs font-medium text-slate-600">
          Or paste a Google Maps link instead
          <input
            type="url"
            inputMode="url"
            value={mapLink}
            onChange={(e) => onLinkChange(e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className="input mt-1 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
