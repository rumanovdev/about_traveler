import { useEffect, useRef } from "react";

interface MapListing {
  id: string;
  slug: string;
  business_name: string;
  latitude: number;
  longitude: number;
  price_from?: number | null;
  rating?: number | null;
}

interface ListingsMapProps {
  listings: MapListing[];
  hoveredId: string | null;
  center?: [number, number];
}

// Load Leaflet CSS once
let leafletCssLoaded = false;
function ensureLeafletCss() {
  if (leafletCssLoaded) return;
  leafletCssLoaded = true;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

const ListingsMap = ({ listings, hoveredId, center }: ListingsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Default center: Greece
  const defaultCenter: [number, number] = center || [37.98, 23.73];

  useEffect(() => {
    ensureLeafletCss();

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      listings.forEach((listing) => {
        if (!listing.latitude || !listing.longitude) return;

        const label = listing.price_from ? `€${Math.round(listing.price_from)}` : "•";

        const icon = L.divIcon({
          className: "",
          html: `<div class="map-price-pin" data-id="${listing.id}" style="
            background:#fff;
            border:2px solid #222;
            border-radius:20px;
            padding:4px 10px;
            font-size:12px;
            font-weight:700;
            color:#222;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.18);
            cursor:pointer;
            transition:all 0.15s;
          ">${label}</div>`,
          iconAnchor: [20, 16],
        });

        const marker = L.marker([listing.latitude, listing.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px">
              <b style="font-size:13px">${listing.business_name}</b>
              ${listing.price_from ? `<p style="margin:4px 0 0;font-size:12px;color:#555">από €${Math.round(listing.price_from)} / νύχτα</p>` : ""}
              <a href="/listing/${listing.slug}" style="display:inline-block;margin-top:6px;font-size:12px;color:#0070f3;text-decoration:underline">Δείτε listing →</a>
            </div>
          `, { maxWidth: 220 });

        markersRef.current.set(listing.id, marker);
      });

      // Fit bounds if we have markers
      const validListings = listings.filter((l) => l.latitude && l.longitude);
      if (validListings.length > 1) {
        const bounds = L.latLngBounds(validListings.map((l) => [l.latitude, l.longitude]));
        map.fitBounds(bounds, { padding: [40, 40] });
      } else if (validListings.length === 1) {
        map.setView([validListings[0].latitude, validListings[0].longitude], 13);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Update markers appearance on hover
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()?.querySelector(".map-price-pin") as HTMLElement | null;
      if (!el) return;
      if (id === hoveredId) {
        el.style.background = "#222";
        el.style.color = "#fff";
        el.style.transform = "scale(1.15)";
        el.style.zIndex = "1000";
        marker.setZIndexOffset(1000);
      } else {
        el.style.background = "#fff";
        el.style.color = "#222";
        el.style.transform = "scale(1)";
        el.style.zIndex = "";
        marker.setZIndexOffset(0);
      }
    });
  }, [hoveredId]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: 400 }}
    />
  );
};

export default ListingsMap;
