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
        attributionControl: false,
        center: defaultCenter,
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers
      listings.forEach((listing) => {
        if (!listing.latitude || !listing.longitude) return;

        const label = listing.price_from ? `€${Math.round(listing.price_from)}` : null;

        const icon = L.divIcon({
          className: "",
          html: `
            <div class="map-price-pin" data-id="${listing.id}" style="
              position:relative;
              display:inline-flex;
              flex-direction:column;
              align-items:center;
              cursor:pointer;
              transition:transform 0.15s;
              filter:drop-shadow(0 3px 6px rgba(0,0,0,0.22));
            ">
              ${label ? `
                <div style="
                  background:#1a1a1a;
                  color:#fff;
                  border-radius:24px;
                  padding:5px 11px;
                  font-size:12px;
                  font-weight:700;
                  white-space:nowrap;
                  letter-spacing:-0.2px;
                  line-height:1;
                ">${label}</div>
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-top:-1px">
                  <path d="M5 7L0 0H10L5 7Z" fill="#1a1a1a"/>
                </svg>
              ` : `
                <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#1a1a1a"/>
                  <circle cx="14" cy="14" r="5" fill="white"/>
                </svg>
              `}
            </div>
          `,
          iconAnchor: label ? [28, 40] : [14, 36],
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
        el.style.transform = "scale(1.18) translateY(-2px)";
        el.style.filter = "drop-shadow(0 6px 12px rgba(0,0,0,0.35))";
        el.style.zIndex = "1000";
        marker.setZIndexOffset(1000);
      } else {
        el.style.transform = "scale(1)";
        el.style.filter = "drop-shadow(0 3px 6px rgba(0,0,0,0.22))";
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
