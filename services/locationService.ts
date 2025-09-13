export const getPlaceDetails = async (placeId: string) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(placeId)}&apiKey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch place details');
    const data = await res.json();
    return data.features && data.features[0] ? data.features[0].properties : null;
};

export const getAddressFromCoordinates = (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
            return reject("Google Maps API not loaded.");
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                reject('Geocoder failed due to: ' + status);
            }
        });
    });
};

export const getAddressSuggestions = async (
    input: string,
    markerPosition?: { lat: number; lng: number }
): Promise<{ description: string; place_id: string }[]> => {
    if (!input || input.length < 3) return [];
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GEOAPIFY_API_KEY;

    const categories = [
        'commercial.supermarket',
        'catering.restaurant',
        'catering.cafe',
        'entertainment.cinema',
        'tourism.hotel',
        'leisure.park',
        'education.school',
        'healthcare.hospital',
        'transport.airport',
        'transport.bus',
        'transport.train',
        'commercial.shopping_mall',
        'commercial.bakery',
        'commercial.pharmacy',
        'commercial.bank',
        'commercial.gas_station',
        'commercial.post_office',
        'commercial.bookstore',
        'commercial.bicycle_shop',
        'commercial.car_rental',
        'commercial.laundry',
        'commercial.hairdresser',
        'commercial.sports_shop',
        'commercial.shoe_shop',
        'commercial.jewelry',
        'commercial.florist',
        'commercial.optician',
        'commercial.toy_shop',
        'commercial.music_shop',
        'commercial.electronics',
        'commercial.furniture',
        'commercial.hardware',
        'commercial.pet_shop',
        'commercial.stationery',
        'commercial.grocery',
        'commercial.marketplace',
        'commercial.butcher',
        'commercial.cheese_shop',
        'commercial.fishmonger',
        'commercial.greengrocer',
        'commercial.deli',
        'commercial.wine_shop',
        'commercial.sports_centre',
        'commercial.spa',
        'commercial.travel_agency',
        'commercial.real_estate',
        'commercial.cleaning',
        'commercial.photography',
        'commercial.tailor',
        'commercial.watch_shop',
        'commercial.locksmith',
        'commercial.paint_shop',
        'commercial.tattoo',
        'commercial.veterinary',
        'commercial.dry_cleaner',
        'commercial.copyshop',
        'commercial.courier',
        'commercial.repair',
        'commercial.souvenir',
        'commercial.travel',
        'commercial.variety_store',
        'commercial.wholesale',
        'commercial.wine',
        'commercial.yarn_shop',
        'commercial.zoo',
    ];
    const matchedCategory = categories.find(cat => cat.split('.').pop()?.toLowerCase() === input.toLowerCase());

    if (matchedCategory && markerPosition) {
        const dLat = 0.02, dLng = 0.02;
        const rect = [
            markerPosition.lng - dLng,
            markerPosition.lat + dLat,
            markerPosition.lng + dLng,
            markerPosition.lat - dLat
        ];
        const url = `https://api.geoapify.com/v2/places?categories=${matchedCategory}&filter=rect:${rect.join(',')}&limit=10&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.features) return [];
        return data.features.map((f: any) => ({
            description: f.properties.name + (f.properties.address_line2 ? (', ' + f.properties.address_line2) : ''),
            place_id: f.properties.place_id || f.properties.osm_id || f.properties.name
        }));
    } else {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&limit=5&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.features) return [];
        return data.features.map((f: any) => ({
            description: f.properties.formatted,
            place_id: f.properties.place_id || f.properties.placeId || f.properties.osm_id || f.properties.datasource?.raw?.osm_id || f.properties.formatted
        }));
    }
};


export const getCoordinatesFromPlaceId = (placeId: string): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps) {
            return reject("Google Maps API not loaded.");
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: placeId }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                resolve({ lat: location.lat(), lng: location.lng() });
            } else {
                reject('Geocoder failed due to: ' + status);
            }
        });
    });
};