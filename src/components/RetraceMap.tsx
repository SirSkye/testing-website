"use client";

/**
 * RetraceMap
 * ----------
 * Drop-in Mapbox GL component that animates a trip's route on a tilted,
 * 3D-pitched map with real building extrusions: the line draws itself in,
 * colored from deep purple (older / farther back in the trip) to warm amber
 * (right now / the current point), and photo markers pop in as the
 * animation passes each waypoint.
 *
 * Setup
 *   npm install mapbox-gl @turf/turf lucide-react
 *   npm install -D @types/mapbox-gl
 *
 * Usage
 *   <RetraceMap trip={myTrip} mapboxToken={YOUR_TOKEN} />
 *
 * Next.js (app router): this touches `window` via mapbox-gl, so import it
 * with ssr disabled from whatever page renders it:
 *   const RetraceMap = dynamic(() => import(".../RetraceMap"), { ssr: false });
 *
 * Token: pass it in as a prop from wherever your app already keeps it
 * (env var, config, etc.) — this file doesn't read any env var itself so it
 * doesn't matter whether you're on Next.js or Vite.
 *
 * Photos: Waypoint.photos[].src is just a local path (e.g. "/photos/x.jpg").
 * Put the files in your public folder; nothing here fetches remote storage.
 *
 * 3D buildings: extruded from the style's own `composite` vector source
 * (the `building` source-layer), the same data every Mapbox style ships
 * with. No extra token scopes, no extra network request — just a layer
 * added on top of whatever base style you pass in. Note this only works
 * with Mapbox's classic (v1) styles — dark-v11, light-v11, streets-v12,
 * satellite-streets-v12, etc. — which is what `mapStyle` defaults to.
 * The newer `mapbox://styles/mapbox/standard` style renders its own 3D
 * buildings natively and does NOT use this composite/building layer, so if
 * you swap to Standard, delete the buildings-layer block below instead.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { Feature, LineString } from "geojson";
import { Play, Pause, RotateCcw, Repeat } from "lucide-react";
import type { Trip, Waypoint } from "./types";

interface RetraceMapProps {
  trip: Trip;
  mapboxToken: string;
  /** Any Mapbox style URL. Dark styles read best with the purple/amber trail. */
  mapStyle?: string;
  /** How long one full playthrough takes. */
  durationMs?: number;
  autoplay?: boolean;
  className?: string;
  /** Turn off the 3D building extrusions if you just want the flat basemap back. */
  show3dBuildings?: boolean;
  /**
   * Chase-cam mode: instead of fitting the whole route in frame, the camera
   * stays zoomed in and pans/rotates to follow the "you are here" dot as it
   * travels, like a first-person retrace of the trip.
   */
  followCamera?: boolean;
  /** How close the follow camera sits. Higher = tighter/more zoomed in. */
  followZoom?: number;
  /** Camera tilt while following. */
  followPitch?: number;
  /** If true, the camera bearing turns to face the direction of travel. If false, bearing stays fixed. */
  rotateWithRoute?: boolean;
  /** Disable manual drag/zoom/rotate while the follow-cam animation is playing, so it doesn't fight the user. */
  lockInteractionWhilePlaying?: boolean;
  /**
   * If true (default), the traced path is snapped to actual streets/paths
   * via the Mapbox Directions API instead of drawing straight lines between
   * waypoints. Falls back to straight lines automatically if the request
   * fails (offline, rate-limited, no road network at that spot, etc).
   */
  snapToRoads?: boolean;
  /** Which Directions profile to route with. "walking" suits foot traffic/hikes; use "driving" or "cycling" for road trips or bike rides. */
  routingProfile?: "walking" | "cycling" | "driving" | "driving-traffic";
}

/**
 * Fetches a road-snapped path through a trip's waypoints, in order, from the
 * Mapbox Directions API. Returns null (rather than throwing) if there simply
 * isn't a usable route, so callers can fall back to straight lines.
 *
 * Note: Directions accepts at most 25 coordinates per request for the
 * walking/cycling/driving profiles. Trips with more waypoints than that will
 * skip snapping and fall back automatically — split a very long trip into
 * multiple RetraceMap trips if you need more waypoints snapped.
 */
async function fetchRoadRoute(
  waypoints: { lng: number; lat: number }[],
  profile: string,
  token: string
): Promise<Feature<LineString> | null> {
  if (waypoints.length < 2 || waypoints.length > 25) return null;
  const coordString = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordString}?geometries=geojson&overview=full&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API responded ${res.status}`);
  const data = await res.json();
  const geometry = data?.routes?.[0]?.geometry;
  if (!geometry || geometry.type !== "LineString") return null;
  return { type: "Feature", properties: {}, geometry } as Feature<LineString>;
}

const COLOR_FAR: [number, number, number] = [59, 26, 99]; // #3B1A63 deep purple
const COLOR_MID: [number, number, number] = [139, 79, 160]; // #8B4FA0
const COLOR_NEAR: [number, number, number] = [255, 201, 77]; // #FFC94D warm amber

function mixColor(t: number): string {
  const c = Math.max(0, Math.min(1, t));
  const [a, b] = c < 0.55 ? [COLOR_FAR, COLOR_MID] : [COLOR_MID, COLOR_NEAR];
  const localT = c < 0.55 ? c / 0.55 : (c - 0.55) / 0.45;
  const r = Math.round(a[0] + (b[0] - a[0]) * localT);
  const g = Math.round(a[1] + (b[1] - a[1]) * localT);
  const bch = Math.round(a[2] + (b[2] - a[2]) * localT);
  return `rgb(${r}, ${g}, ${bch})`;
}

const HOLD_MS = 1600;

export default function RetraceMap({
  trip,
  mapboxToken,
  mapStyle = "mapbox://styles/mapbox/dark-v11",
  durationMs = 5000,
  autoplay = true,
  className = "",
  show3dBuildings = true,
  followCamera = true,
  followZoom = 17.5,
  followPitch = 60,
  rotateWithRoute = true,
  lockInteractionWhilePlaying = true,
  snapToRoads = true,
  routingProfile = "walking",
}: RetraceMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeRef = useRef<Feature<LineString> | null>(null);
  const totalLenRef = useRef(0);
  const waypointDistRef = useRef<number[]>([]);

  const [playing, setPlaying] = useState(autoplay);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [ready, setReady] = useState(false);
  // Off by default: the trace plays once and stops on the final frame.
  // Flip this on (via the Repeat button) to have it replay automatically.
  const [looping, setLooping] = useState(false);
  const loopingRef = useRef(looping);
  useEffect(() => {
    loopingRef.current = looping;
  }, [looping]);

  // ---- build map once ----
  useEffect(() => {
    if (!containerRef.current || trip.waypoints.length < 2) return;

    mapboxgl.accessToken = mapboxToken;

    const first = trip.waypoints[0];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [first.lng, first.lat],
      zoom: followCamera ? followZoom : 15.5,
      pitch: followCamera ? followPitch : 55,
      bearing: -12,
      antialias: true, // smooths the edges of extruded building walls
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", async () => {
      // Build the route through the waypoints in order. Try the real road
      // network first; fall back to straight lines between waypoints if
      // snapping is off, fails, or there are too many waypoints to snap.
      const coords = trip.waypoints.map((w) => [w.lng, w.lat] as [number, number]);
      let route: Feature<LineString> = turf.lineString(coords);

      if (snapToRoads) {
        try {
          const snapped = await fetchRoadRoute(trip.waypoints, routingProfile, mapboxToken);
          if (snapped) {
            route = snapped;
          } else {
            console.warn(
              "RetraceMap: no road-snapped route available for this trip (too many waypoints, or no route found) — falling back to straight lines."
            );
          }
        } catch (err) {
          console.warn(
            "RetraceMap: road snapping request failed, falling back to straight lines between waypoints.",
            err
          );
        }
      }

      // Bail out if the map was unmounted while we were awaiting the fetch.
      if (!mapRef.current) return;

      routeRef.current = route;
      totalLenRef.current = turf.length(route, { units: "kilometers" });

      // Distance of each original waypoint along the route. Using
      // nearestPointOnLine (rather than a straight cumulative sum) works
      // whether `route` is the raw straight-line path (waypoints ARE its
      // vertices) or a road-snapped path (waypoints sit near, but not
      // necessarily exactly on, the snapped line).
      waypointDistRef.current = trip.waypoints.map((wp) => {
        const snap = turf.nearestPointOnLine(route, turf.point([wp.lng, wp.lat]), {
          units: "kilometers",
        });
        return snap.properties.location ?? 0;
      });

      // Follow mode stays zoomed in on the traveling dot (set on the camera
      // itself in the animation loop), so skip the wide establishing shot.
      // Non-follow mode still frames the whole route up front.
      if (!followCamera) {
        const bbox = turf.bbox(route) as [number, number, number, number];
        map.fitBounds(bbox, { padding: 80, pitch: 55, bearing: -12, duration: 0 });
      }

      // ---- 3D buildings ----
      // Extrude the style's own building footprints. Every classic Mapbox
      // style (dark-v11, streets-v12, light-v11, satellite-streets-v12...)
      // ships this data on the "composite" source under the "building"
      // source-layer, with an "extrude" prop of "true" on real buildings.
      if (show3dBuildings) {
        const styleLayers = map.getStyle()?.layers ?? [];
        // Insert the extrusion just below the first symbol (label) layer so
        // place names/labels still render on top of the rooftops.
        const labelLayerId = styleLayers.find(
          (layer) => layer.type === "symbol" && !!(layer.layout as any)?.["text-field"]
        )?.id;

        if (!map.getLayer("retrace-3d-buildings")) {
          map.addLayer(
            {
              id: "retrace-3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 13,
              paint: {
                // Deep-purple walls that sit quietly behind the amber/purple
                // trail instead of competing with it.
                "fill-extrusion-color": "#241238",
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  13, 0,
                  13.5, ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  13, 0,
                  13.5, ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.75,
              },
            },
            labelLayerId
          );
        }
      }

      // Faint full-route preview, always visible.
      map.addSource("route-full", { type: "geojson", data: route });
      map.addLayer({
        id: "route-full-line",
        type: "line",
        source: "route-full",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#EAD9FF", "line-width": 3, "line-opacity": 0.18 },
      });

      // Animated, gradient-colored traveled portion.
      const routeStart = route.geometry.coordinates[0] as [number, number];
      map.addSource("route-progress", {
        type: "geojson",
        lineMetrics: true,
        data: turf.lineString([routeStart, routeStart]),
      });
      map.addLayer({
        id: "route-progress-line",
        type: "line",
        source: "route-progress",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 5,
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0, "#3B1A63",
            0.55, "#8B4FA0",
            1, "#FFC94D",
          ],
        },
      });

      // Waypoint markers, hidden until the animation reaches them.
      //
      // IMPORTANT: Mapbox GL sets its own CSS `transform` on the marker's
      // root element to position it at the right pixel coordinates. If we
      // also set `transform` on that same root element (e.g. for a pop-in
      // scale effect), we clobber Mapbox's positioning transform and the
      // marker renders at (0,0) — the top-left corner — instead of on the
      // map. So the scale animation lives on a nested `.retrace-marker-inner`
      // div instead, and the root element is left alone.
      markersRef.current = trip.waypoints.map((wp) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div class="retrace-marker-inner"
               style="transform-origin:50% 100%; transform:scale(0.001); transition:transform 0.45s cubic-bezier(0.34,1.56,0.64,1); display:flex; flex-direction:column; align-items:center;">
            <div style="width:64px;height:64px;background:#170A28;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.3);box-shadow:0 10px 15px -3px rgba(0,0,0,0.35),0 4px 6px -4px rgba(0,0,0,0.35);overflow:hidden;">
              ${
                wp.photos[0]
                  ? `<img src="${wp.photos[0].src}" alt="${wp.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
                  : ""
              }
            </div>
            <div style="margin-top:0.25rem;padding:0.125rem 0.5rem;border-radius:9999px;font-size:11px;font-weight:500;white-space:nowrap;background:#170A28cc;color:#F6EFE2;border:1px solid rgba(255,255,255,0.15);">
              ${wp.name}
            </div>
          </div>
        `;
        return new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map);
      });

      // Traveling "you are here" marker.
      const dotEl = document.createElement("div");
      dotEl.style.width = "16px";
      dotEl.style.height = "16px";
      dotEl.style.borderRadius = "50%";
      dotEl.style.background = "#FFF6E5";
      dotEl.style.border = "3px solid #3B1A63";
      dotEl.style.boxShadow = "0 0 0 6px rgba(255,201,77,0.25)";
      currentMarkerRef.current = new mapboxgl.Marker({ element: dotEl })
        .setLngLat(routeStart)
        .addTo(map);

      setReady(true);
    });

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      markersRef.current.forEach((m) => m.remove());
      currentMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  // ---- animation loop ----
  const tick = useCallback(
    (ts: number) => {
      const map = mapRef.current;
      const route = routeRef.current;
      if (!map || !route) return;

      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;

      // Looping: hold briefly at the end, then wrap back to the start.
      // Not looping (default): play through once and stop on the final frame.
      let progress: number;
      let finished = false;
      if (loopingRef.current) {
        const total = durationMs + HOLD_MS;
        const local = elapsed % total;
        progress = local < durationMs ? local / durationMs : 1;
      } else {
        progress = elapsed < durationMs ? elapsed / durationMs : 1;
        finished = elapsed >= durationMs;
      }

      const totalLen = totalLenRef.current;
      const distance = progress * totalLen;

      const partial =
        distance <= 0
          ? turf.lineString([route.geometry.coordinates[0], route.geometry.coordinates[0]])
          : turf.lineSliceAlong(route, 0, distance, { units: "kilometers" });

      const src = map.getSource("route-progress") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(partial as Feature<LineString>);

      const point = turf.along(route, distance, { units: "kilometers" });
      const [lng, lat] = point.geometry.coordinates;
      currentMarkerRef.current?.setLngLat([lng, lat]);

      const dotColor = mixColor(progress);
      const el = currentMarkerRef.current?.getElement();
      if (el) {
        el.style.border = `3px solid ${dotColor}`;
        el.style.boxShadow = `0 0 0 6px ${dotColor}40`;
      }

      // ---- chase camera ----
      // We already run our own rAF loop, so we move the camera with a plain
      // jumpTo (synchronous, no easing) each frame rather than map.easeTo —
      // stacking easeTo calls 60x/sec fights itself and stutters.
      if (followCamera) {
        let bearing = map.getBearing();
        if (rotateWithRoute) {
          const lookBack = Math.max(distance - 0.03, 0);
          const lookAhead = Math.min(distance + 0.03, totalLen);
          const behind = turf.along(route, lookBack, { units: "kilometers" });
          const ahead = turf.along(route, lookAhead, { units: "kilometers" });
          const [blng, blat] = behind.geometry.coordinates;
          const [alng, alat] = ahead.geometry.coordinates;
          if (alng !== blng || alat !== blat) {
            bearing = turf.bearing(behind, ahead);
          }
        }
        map.jumpTo({ center: [lng, lat], zoom: followZoom, pitch: followPitch, bearing });
      }

      // Reveal waypoint markers as the animation passes them.
      const dists = waypointDistRef.current;
      let nowActive: Waypoint | null = null;
      trip.waypoints.forEach((wp, i) => {
        const visited = distance >= dists[i] - 0.001;
        const markerRoot = markersRef.current[i]?.getElement();
        const innerEl = markerRoot?.querySelector<HTMLElement>(".retrace-marker-inner");
        if (innerEl) innerEl.style.transform = visited ? "scale(1)" : "scale(0.001)";
        if (visited) nowActive = wp;
      });
      setActiveWaypoint(nowActive);

      if (finished) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [durationMs, trip.waypoints, followCamera, followZoom, followPitch, rotateWithRoute]
  );

  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Show the finished state without animating.
      startRef.current = null;
      const fakeTs = durationMs + HOLD_MS + 1;
      startRef.current = 0;
      tick(fakeTs);
      return;
    }
    if (!playing) return;

    const map = mapRef.current;
    const shouldLock = followCamera && lockInteractionWhilePlaying && map;
    if (shouldLock) {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
    }

    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (shouldLock) {
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.dragRotate.enable();
        map.touchZoomRotate.enable();
        map.doubleClickZoom.enable();
      }
    };
  }, [ready, playing, tick, durationMs, followCamera, lockInteractionWhilePlaying]);

  const restart = () => {
    startRef.current = null;
    setPlaying(true);
  };

  const controlButtonStyle: CSSProperties = {
    borderRadius: "9999px",
    padding: "0.5rem",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
  };

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", minHeight: 400 }}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, borderRadius: "1rem", overflow: "hidden" }}
      />

      {/* status + controls overlay */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          right: "4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#170A28cc",
            color: "#F6EFE2",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "0.375rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            pointerEvents: "auto",
          }}
        >
          {activeWaypoint ? (
            <>
              <span style={{ fontWeight: 600 }}>{activeWaypoint.time}</span> at{" "}
              {activeWaypoint.name.toLowerCase()}
            </>
          ) : (
            "Setting off…"
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", pointerEvents: "auto" }}>
          <button
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Pause" : "Play"}
            style={{ ...controlButtonStyle, background: "#170A28cc", color: "#F6EFE2" }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={restart}
            aria-label="Restart"
            style={{ ...controlButtonStyle, background: "#170A28cc", color: "#F6EFE2" }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setLooping((v) => !v)}
            aria-label={looping ? "Turn off looping" : "Turn on looping"}
            aria-pressed={looping}
            title={looping ? "Looping on" : "Looping off"}
            style={{
              ...controlButtonStyle,
              background: looping ? "#FFC94D" : "#170A28cc",
              color: looping ? "#170A28" : "#F6EFE2",
            }}
          >
            <Repeat size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
