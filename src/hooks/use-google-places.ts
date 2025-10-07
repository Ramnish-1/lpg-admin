/*
  Lightweight Google Maps Places loader and helpers.
  Avoids adding external deps and ensures the script loads once.
*/

const GOOGLE_MAPS_GLOBAL = 'google';

function loadScriptOnce(src: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    (script as any)._loaded = false;
    script.addEventListener('load', () => {
      (script as any)._loaded = true;
      resolve();
    });
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
    document.head.appendChild(script);
  });
}

export async function loadGooglePlaces(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const hasPlaces = (window as any)[GOOGLE_MAPS_GLOBAL]?.maps?.places;
  if (hasPlaces) return;
  const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  await loadScriptOnce(src);
}

export type ParsedPlace = {
  title: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  landmark: string | null;
};

export function parsePlace(place: any): ParsedPlace {
  const components: Array<any> = place?.address_components || [];
  const get = (type: string) => components.find(c => (c.types || []).includes(type));
  const cityComp = get('locality') || get('administrative_area_level_2') || get('administrative_area_level_1');
  const pincodeComp = get('postal_code');
  const sublocality = get('sublocality') || get('sublocality_level_1') || get('neighborhood');
  return {
    title: place?.name || null,
    address: place?.formatted_address || null,
    city: cityComp?.long_name || null,
    pincode: pincodeComp?.long_name || null,
    landmark: sublocality?.long_name || null,
  };
}

export function createAutocomplete(input: HTMLInputElement, options?: Record<string, any>) {
  const g = (window as any).google;
  if (!g?.maps?.places) return null;
  const ac = new g.maps.places.Autocomplete(input, {
    fields: ['address_components', 'formatted_address', 'name'],
    ...options,
  });
  return ac;
}

export function createMap(container: HTMLElement, options?: Record<string, any>) {
  const g = (window as any).google;
  if (!g?.maps) return null;
  const map = new g.maps.Map(container, {
    center: { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
    zoom: 13,
    ...options,
  });
  return map;
}

export function addMapClickListener(map: any, callback: (lat: number, lng: number) => void) {
  if (!map) return null;
  const listener = map.addListener('click', (event: any) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    callback(lat, lng);
  });
  return listener;
}

export function reverseGeocode(lat: number, lng: number): Promise<ParsedPlace> {
  return new Promise((resolve) => {
    const g = (window as any).google;
    if (!g?.maps) {
      resolve({ title: null, address: null, city: null, pincode: null, landmark: null });
      return;
    }
    
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        resolve(parsePlace(results[0]));
      } else {
        resolve({ title: null, address: null, city: null, pincode: null, landmark: null });
      }
    });
  });
}


