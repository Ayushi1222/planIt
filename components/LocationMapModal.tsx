import React, { useState } from 'react';
import ReactDOM from 'react-dom';

interface MarkerConfig {
    lat: number;
    lng: number;
    color?: string;
    icon?: string;
    size?: string;
}

interface LocationMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: {
        latitude: number;
        longitude: number;
    };
    onSave: (newLocation: { lat: number; lng: number }) => void;
    markers?: MarkerConfig[];
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({ isOpen, onClose, location, onSave, markers }) => {
    const [markerPosition, setMarkerPosition] = useState({ lat: location.latitude, lng: location.longitude });

    // Use environment variable for Geoapify API key
    const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const buildMarkerString = (main: { lat: number; lng: number }, extra?: MarkerConfig[]) => {
        let markerStr = `lonlat:${main.lng},${main.lat};type:awesome;color:%2338bdf8;size:x-large;icon:map-marker`;
        if (extra && extra.length > 0) {
            markerStr += '|' + extra.map(m =>
                `lonlat:${m.lng},${m.lat}` +
                ';type:material' +
                (m.color ? `;color:${encodeURIComponent(m.color)}` : '') +
                (m.size ? `;size:${m.size}` : '') +
                (m.icon ? `;icon:${m.icon}` : '')
            ).join('|');
        }
        return markerStr;
    };

    const getStaticMapUrl = (lat: number, lng: number, extraMarkers?: MarkerConfig[]) =>
        `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat:${lng},${lat}&zoom=14&marker=${buildMarkerString({ lat, lng }, extraMarkers)}&apiKey=${GEOAPIFY_API_KEY}`;

    if (!isOpen) return null;

    const moveMarker = (dLat: number, dLng: number) => {
        setMarkerPosition(pos => ({ lat: +(pos.lat + dLat).toFixed(6), lng: +(pos.lng + dLng).toFixed(6) }));
    };

    const handleSave = () => {
        onSave(markerPosition);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Adjust Your Location</h3>
                    <p className="text-sm text-slate-400">Use the buttons to move the marker and set your starting location.</p>
                </div>
                <div className="flex flex-col items-center justify-center" style={{ minHeight: '420px' }}>
                    <img
                        src={getStaticMapUrl(markerPosition.lat, markerPosition.lng, markers)}
                        alt="Map preview"
                        style={{ width: 600, height: 400, borderRadius: '0.5rem', border: '1px solid #334155', marginBottom: 12 }}
                    />
                    <div className="flex gap-2 mb-2">
                        <button onClick={() => moveMarker(0.0005, 0)} className="px-2 py-1 bg-slate-700 text-white rounded">▲</button>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <button onClick={() => moveMarker(0, -0.0005)} className="px-2 py-1 bg-slate-700 text-white rounded">◀</button>
                        <span className="px-2 py-1 bg-slate-900 text-white rounded">Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}</span>
                        <button onClick={() => moveMarker(0, 0.0005)} className="px-2 py-1 bg-slate-700 text-white rounded">▶</button>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => moveMarker(-0.0005, 0)} className="px-2 py-1 bg-slate-700 text-white rounded">▼</button>
                    </div>
                </div>
                <div className="p-4 flex justify-end gap-3 bg-slate-800/50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-slate-600 hover:bg-slate-500 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors">Save Location</button>
                </div>
            </div>
        </div>,
        document.body
    );
}