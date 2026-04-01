/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";

interface Prediction {
  description: string;
  place_id: string;
}

export interface PlaceDetails {
  description: string;
  place_id: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
}

declare global {
  interface Window {
    google?: typeof google;
  }
}

let mapsLoading = false;
let mapsReady = false;

function loadGoogleMaps() {
  if (window.google?.maps?.places || mapsReady) {
    mapsReady = true;
    return;
  }

  if (mapsLoading) return;
  mapsLoading = true;

  const existingScript = document.querySelector('script[data-google-maps="places"]') as HTMLScriptElement | null;
  if (existingScript) {
    existingScript.addEventListener("load", () => { mapsReady = true; mapsLoading = false; }, { once: true });
    existingScript.addEventListener("error", () => { mapsLoading = false; }, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDAh-qHD8clrKFzIyhhKJORj5naYOSWarQ&libraries=places";
  script.async = true;
  script.defer = true;
  script.dataset.googleMaps = "places";
  script.onload = () => { mapsReady = true; mapsLoading = false; };
  script.onerror = () => { mapsLoading = false; };
  document.head.appendChild(script);
}

export const usePlacesAutocomplete = () => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = () => {
      if (window.google?.maps?.places) {
        serviceRef.current = new google.maps.places.AutocompleteService();
        if (!dummyDivRef.current) {
          dummyDivRef.current = document.createElement("div");
        }
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDivRef.current);
      }
    };
    if (window.google?.maps?.places) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          init();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const search = useCallback((input: string) => {
    setQuery(input);
    if (!input || input.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    loadGoogleMaps();

    if (!serviceRef.current && window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }

    if (!serviceRef.current) return;

    try {
      serviceRef.current.getPlacePredictions(
        { input, componentRestrictions: { country: "gr" } },
        (results, status) => {
          const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK;
          const isOk = status === okStatus || String(status) === "OK";
          if (isOk && results?.length) {
            setPredictions(results.map((r) => ({ description: r.description, place_id: r.place_id })));
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    } catch {
      setPredictions([]);
      setIsOpen(false);
    }
  }, []);

  // Returns full place details including lat/lng and formatted_address
  const getPlaceDetails = useCallback((placeId: string): Promise<PlaceDetails | null> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current && window.google?.maps?.places) {
        if (!dummyDivRef.current) dummyDivRef.current = document.createElement("div");
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDivRef.current);
      }
      if (!placesServiceRef.current) { resolve(null); return; }

      placesServiceRef.current.getDetails(
        { placeId, fields: ["geometry", "formatted_address", "name"] },
        (result, status) => {
          const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK;
          const isOk = status === okStatus || String(status) === "OK";
          if (isOk && result) {
            resolve({
              description: result.name || "",
              place_id: placeId,
              lat: result.geometry?.location?.lat() ?? null,
              lng: result.geometry?.location?.lng() ?? null,
              address: result.formatted_address ?? null,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  const select = useCallback((prediction: Prediction) => {
    setQuery(prediction.description);
    setPredictions([]);
    setIsOpen(false);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return { query, predictions, isOpen, search, select, close, setQuery, getPlaceDetails };
};
