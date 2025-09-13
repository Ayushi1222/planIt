import React, { useState, useEffect, useRef, useReducer } from "react";
import type { Preferences } from "../shared/types";
import {
  SparklesIcon,
  ArrowRightIcon,
  LocationIcon,
  EditIcon,
  CalendarIcon,
} from "../assets/icons";
import { LocationMapModal } from "./LocationMapModal";
import {
  getAddressFromCoordinates,
  getAddressSuggestions,
  getCoordinatesFromPlaceId,
} from "../services/locationService";
import { useDebounce } from "../hooks/useDebounce";


interface PreferenceFormProps {
  onSubmit: (preferences: Preferences) => void;
}

type OptionType = { id: string; label: string };

const paceOptions: OptionType[] = [
  { id: 'relaxed', label: 'Take it easy' },
  { id: 'balanced', label: 'A bit of everything' },
  { id: 'adventurous', label: 'Pack it full' },
];

const vibeOptions: OptionType[] = [
  { id: 'chill', label: 'Chill vibes' },
  { id: 'thrilling', label: 'Thrill seekers' },
  { id: 'party', label: 'Party mood' },
  { id: 'family', label: 'Family fun' },
  { id: 'foodie', label: 'Food lovers' },
  { id: 'culture', label: 'Explore culture' },
];

const budgetOptions: OptionType[] = [
  { id: 'under-3000', label: 'Less than ₹3k' },
  { id: '3000-5000', label: '₹3k - ₹5k' },
  { id: '5000-10000', label: '₹5k - ₹10k' },
  { id: 'above-10000', label: 'More than ₹10k' },
];

const interestOptions: OptionType[] = [
  { id: 'live-music', label: 'Live music' },
  { id: 'fine-dining', label: 'Fine dining' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'outdoors', label: 'Outdoor fun' },
  { id: 'art-culture', label: 'Art & history' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'wellness', label: 'Spa & wellness' },
  { id: 'heritage', label: 'Historic places' },
  { id: 'nature', label: 'Parks & nature' },
];

const groupOptions: OptionType[] = [
  { id: 'solo', label: 'Just me' },
  { id: 'couple', label: 'Couple' },
  { id: 'small-group', label: 'Small group (3-5)' },
  { id: 'large-group', label: 'Big group (5+)' },
];

const distanceOptions: OptionType[] = [
  { id: '5km', label: 'Nearby (within 5 km)' },
  { id: '15km', label: 'A bit farther (5–15 km)' },
  { id: '30km', label: 'Go explore (15+ km)' },
];

const dietaryOptions: OptionType[] = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
];

const occasionOptions: OptionType[] = [
  { id: 'casual', label: 'Just a chill weekend' },
  { id: 'romantic', label: 'Romantic escape' },
  { id: 'celebration', label: 'Celebrate something!' },
  { id: 'family', label: 'Family outing' },
];

const accommodationOptions: OptionType[] = [
  { id: 'luxury', label: 'Luxury stay' },
  { id: 'boutique', label: 'Boutique hotel' },
  { id: 'homestay', label: 'Homestay / Airbnb' },
  { id: 'not-required', label: 'No stay needed' },
];

const transportationOptions: OptionType[] = [
  { id: 'own-vehicle', label: 'My own ride' },
  { id: 'ride-share', label: 'Ride-sharing' },
  { id: 'public-transport', label: 'Public transport' },
  { id: 'walking', label: 'Just walk' },
];

const isLocationServiceConfigured = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DEFAULT_LOCATION = {
  latitude: 28.4595,
  longitude: 77.0266,
  address: 'Gurgaon, Haryana, India'
};

type FormState = Omit<Preferences, "location" | "dates">;
type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; payload: any }
  | {
    type: "TOGGLE_ARRAY_ITEM";
    field: "interests" | "dietaryNeeds" | "accommodation";
    payload: string;
  };

const initialFormState: FormState = {
  pace: "balanced",
  vibe: "chill",
  budget: "5000-10000",
  interests: ["shopping"],
  dietaryNeeds: [],
  group: "couple",
  distance: "15km",
  occasion: "casual",
  accommodation: ["not-required"],
  transportation: "ride-share",
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.payload };
    case "TOGGLE_ARRAY_ITEM": {
      const currentArray = state[action.field] as string[];
      const newArray = currentArray.includes(action.payload)
        ? currentArray.filter((item) => item !== action.payload)
        : [...currentArray, action.payload];
      return { ...state, [action.field]: newArray };
    }
    default:
      return state;
  }
};



const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  titleId: string;
}> = ({ title, children, titleId }) => (
  <div className="space-y-4 border-t border-border-base pt-6 first:border-t-0 first:pt-0">
    <label id={titleId} className="text-xl font-semibold text-text-base">
      {title}
    </label>
    {children}
  </div>
);

const CustomRadio = ({
  options,
  selected,
  onChange,
  labelledby,
}: {
  options: OptionType[];
  selected: string;
  onChange: (value: string) => void;
  labelledby: string;
}) => (
  <div role="radiogroup" aria-labelledby={labelledby} className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="radio"
        aria-checked={selected === option.id}
        onClick={() => onChange(option.id)}
        className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border ${selected === option.id
            ? "bg-primary border-primary text-white font-semibold"
            : "bg-bkg-muted border-border-base hover:bg-primary/20"
          }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const CustomCheckbox = ({
  options,
  selected,
  onChange,
  labelledby,
}: {
  options: OptionType[];
  selected: string[];
  onChange: (id: string) => void;
  labelledby: string;
}) => (
  <div
    role="group"
    aria-labelledby={labelledby}
    className="flex flex-wrap gap-2"
  >
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        role="checkbox"
        aria-checked={selected.includes(option.id)}
        onClick={() => onChange(option.id)}
        className={`px-4 py-2 text-sm rounded-full transition-all duration-200 border ${selected.includes(option.id)
            ? "bg-primary border-primary text-white font-semibold"
            : "bg-bkg-muted border-border-base hover:bg-primary/20"
          }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const PreferenceForm: React.FC<PreferenceFormProps> = ({ onSubmit }) => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "success" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const debouncedAddress = useDebounce(addressInput, 500);
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<{ start: string; end: string } | null>(
    null
  );
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const mapPreviewRef = useRef<any>(null);
  const autocompleteService = useRef<any | null>(null);
  const selectionMadeRef = useRef(false);

  useEffect(() => {
    const initializeService = () => {
      if (window.google && window.google.maps && window.google.maps.places && !autocompleteService.current) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        return true;
      }
      return false;
    };

    if (!initializeService()) {
      const intervalId = setInterval(() => {
        if (initializeService()) {
          clearInterval(intervalId);
        }
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, []);

  const handleSetLocation = (lat: number, lon: number, addr: string) => {
    setLocation({ latitude: lat, longitude: lon, address: addr });
    setLocationStatus("success");
  };

  useEffect(() => {
    if (location && document.getElementById("map-preview") && window.google) {
      if (mapPreviewRef.current) {
        document.getElementById("map-preview")!.innerHTML = "";
      }

      const mapOptions = {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 13,
        disableDefaultUI: true,
        gestureHandling: "none",
      };
      const map = new window.google.maps.Map(
        document.getElementById("map-preview")!,
        mapOptions
      );
      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
      });
      mapPreviewRef.current = map;
    }
  }, [location, locationStatus]);

  const handleDetectLocation = () => {
    setLocationStatus("locating");
    setLocationError(null);
    setAddressInput("");
    setSuggestions([]);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const addr = await getAddressFromCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          handleSetLocation(
            position.coords.latitude,
            position.coords.longitude,
            addr
          );
          setAddressInput(addr);
        } catch {
          setLocationStatus("error");
          setLocationError("Could not fetch address for your location.");
        }
      },
      (error: GeolocationPositionError) => {
        setLocationStatus("error");
        let userMessage = "Could not access location. Please try again.";
        if (error.code === error.PERMISSION_DENIED)
          userMessage =
            "Location access was denied. Please enable it in your browser settings.";
        if (error.code === error.POSITION_UNAVAILABLE)
          userMessage =
            "Your location could not be determined. Please check your device settings.";
        if (error.code === error.TIMEOUT)
          userMessage = "Getting your location took too long. Please try again.";
        setLocationError(userMessage);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    if (selectionMadeRef.current) {
      selectionMadeRef.current = false;
      return;
    }

    if (debouncedAddress && debouncedAddress.length > 3) {
      const fetchSuggestions = async () => {
        setIsSuggestionsLoading(true);
        try {
          const markerPos = location ? { lat: location.latitude, lng: location.longitude } : undefined;
          const results = await getAddressSuggestions(debouncedAddress, markerPos);
          setSuggestions(results);
        } catch (error) {
          console.error("Failed to fetch address suggestions", error);
          setSuggestions([]);
        } finally {
          setIsSuggestionsLoading(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = async (suggestion: {
    description: string;
    place_id: string;
  }) => {
    const { description: address, place_id } = suggestion;
    selectionMadeRef.current = true;
    setAddressInput(address);
    setSuggestions([]);
    try {
      const coords = await getCoordinatesFromPlaceId(place_id);
      handleSetLocation(coords.lat, coords.lng, address);
    } catch (error) {
      setLocationStatus("error");
      setLocationError("Could not get coordinates for the selected address.");
    }
  };

  const handleDateSelect = (date: Date) => {
    const dayOfWeek = date.getDay();
    const start = new Date(date);
    const diff = (dayOfWeek + 2) % 7;
    start.setDate(start.getDate() - diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 2);
    setDates({
      start: start.toLocaleDateString("en-CA"),
      end: end.toLocaleDateString("en-CA"),
    });
    setCalendarOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = location || DEFAULT_LOCATION;
    if (formState.interests.length === 0 || !dates) return;
    onSubmit({ ...formState, location: loc, dates });
  };

  const handleMapSave = async (newLocation: { lat: number; lng: number }) => {
    const addr = await getAddressFromCoordinates(
      newLocation.lat,
      newLocation.lng
    );
    handleSetLocation(newLocation.lat, newLocation.lng, addr);
    setAddressInput(addr);
    setMapModalOpen(false);
  };

  const isFormReady =
    formState.interests.length > 0 &&
    !!dates;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-bkg-surface p-6 md:p-8 rounded-2xl shadow-2xl border border-border-base"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormSection title="1. Pick a weekend" titleId="weekend-dates">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCalendarOpen(!isCalendarOpen)}
                aria-haspopup="true"
                aria-expanded={isCalendarOpen}
                className="w-full flex items-center justify-between bg-bkg-muted border border-border-base rounded-lg px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold text-text-base">
                      {dates
                        ? `${new Date(dates.start + "T00:00:00").toDateString()} - ${new Date(dates.end + "T00:00:00").toDateString()}`
                        : "Choose your weekend"}
                    </span>
                    <p className="text-xs text-text-muted">We'll find events that match your weekend vibe.</p>
                  </div>
                </div>
              </button>
              {isCalendarOpen && <Calendar onSelectDate={handleDateSelect} />}
            </div>
          </FormSection>

          <FormSection title="2. Set your location" titleId="location-set">
            {!isLocationServiceConfigured ? (
              <div className="bg-bkg-muted/50 p-4 rounded-lg border border-accent/30 text-center">
                <p className="text-accent font-semibold">
                  Location Service Not Configured
                </p>
                <p className="text-text-muted text-sm mt-1">
                  A Google Maps API key is required. Set{" "}
                  <code className="bg-bkg-base px-1 py-0.5 rounded">
                    VITE_GOOGLE_MAPS_API_KEY
                  </code>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locationStatus === "locating"}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300 border bg-bkg-muted border-border-base hover:bg-primary/20 disabled:opacity-50"
                >
                  <LocationIcon />
                  <span>
                    {locationStatus === "locating"
                      ? "Detecting..."
                      : "Detect My Location"}
                  </span>
                </button>
                <div className="flex items-center text-xs text-text-subtle">
                  <span className="flex-grow border-t border-border-base"></span>
                  <span className="px-2">OR</span>
                  <span className="flex-grow border-t border-border-base"></span>
                </div>
                <div className="relative" ref={suggestionsContainerRef}>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setLocationStatus("idle");
                      setLocation(null);
                    }}
                    placeholder="Type an address or landmark..."
                    className="w-full bg-bkg-muted border border-border-base rounded-lg px-3 py-2 text-sm text-text-base focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  {isSuggestionsLoading && (
                    <p className="text-xs text-accent text-center mt-2">
                      Searching...
                    </p>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-bkg-muted border border-border-base rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {suggestions.map((s, index) => (
                        <li
                          key={`${s.place_id}-${index}`}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-2 cursor-pointer hover:bg-primary text-sm"
                        >
                          {s.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {locationStatus === "error" && (
                  <p className="text-xs text-red-400 text-center">
                    {locationError}
                  </p>
                )}
                {(locationStatus === "success" && location) || (!location && dates) ? (
                  <div className="text-center pt-3 border-t border-border-base">
                    <p className="font-semibold text-green-400 text-sm">
                      Location Set
                    </p>
                    <p className="text-xs text-text-muted my-1">
                      {(location && location.address) || DEFAULT_LOCATION.address}
                    </p>
                    <div
                      id="map-preview"
                      className="h-24 w-full rounded-lg my-2 border border-border-base bg-bkg-muted"
                    ></div>
                    {location && (
                      <button
                        type="button"
                        onClick={() => setMapModalOpen(true)}
                        className="flex items-center justify-center gap-1 mx-auto text-xs text-primary hover:underline"
                      >
                        <EditIcon className="w-3 h-3" /> Adjust
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </FormSection>
        </div>

        <FormSection
          title="3. Describe your ideal weekend"
          titleId="weekend-description"
        >
          <div className="space-y-6">
            <div>
              <label
                id="occasion-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Occasion
              </label>
              <CustomRadio
                options={occasionOptions}
                selected={formState.occasion}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "occasion", payload: val })
                }
                labelledby="occasion-label"
              />
            </div>
            <div>
              <label
                id="pace-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Pace
              </label>
              <CustomRadio
                options={paceOptions}
                selected={formState.pace}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "pace", payload: val })
                }
                labelledby="pace-label"
              />
            </div>
            <div>
              <label
                id="vibe-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Vibe
              </label>
              <CustomRadio
                options={vibeOptions}
                selected={formState.vibe}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "vibe", payload: val })
                }
                labelledby="vibe-label"
              />
            </div>
            <div>
              <label
                id="budget-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Budget (per person)
              </label>
              <CustomRadio
                options={budgetOptions}
                selected={formState.budget}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "budget", payload: val })
                }
                labelledby="budget-label"
              />
            </div>
            <div>
              <label
                id="radius-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Travel Radius
              </label>
              <CustomRadio
                options={distanceOptions}
                selected={formState.distance}
                onChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "distance",
                    payload: val,
                  })
                }
                labelledby="radius-label"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="4. Tell us about your group & preferences"
          titleId="group-prefs"
        >
          <div className="space-y-6">
            <div>
              <label
                id="group-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Who's going?
              </label>
              <CustomRadio
                options={groupOptions}
                selected={formState.group}
                onChange={(val) =>
                  dispatch({ type: "SET_FIELD", field: "group", payload: val })
                }
                labelledby="group-label"
              />
            </div>
            <div>
              <label
                id="transport-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Transportation Mode
              </label>
              <CustomRadio
                options={transportationOptions}
                selected={formState.transportation}
                onChange={(val) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "transportation",
                    payload: val,
                  })
                }
                labelledby="transport-label"
              />
            </div>
            <div>
              <label
                id="accommodation-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Accommodation
              </label>
              <CustomCheckbox
                options={accommodationOptions}
                selected={formState.accommodation}
                onChange={(id) =>
                  dispatch({
                    type: "TOGGLE_ARRAY_ITEM",
                    field: "accommodation",
                    payload: id,
                  })
                }
                labelledby="accommodation-label"
              />
            </div>
            <div>
              <label
                id="dietary-label"
                className="text-base font-medium text-text-muted mb-2 block"
              >
                Dietary needs?
              </label>
              <CustomCheckbox
                options={dietaryOptions}
                selected={formState.dietaryNeeds}
                onChange={(id) =>
                  dispatch({
                    type: "TOGGLE_ARRAY_ITEM",
                    field: "dietaryNeeds",
                    payload: id,
                  })
                }
                labelledby="dietary-label"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="5. What are your interests?" titleId="interests-section">
          <CustomCheckbox
            options={interestOptions}
            selected={formState.interests}
            onChange={(id) =>
              dispatch({
                type: "TOGGLE_ARRAY_ITEM",
                field: "interests",
                payload: id,
              })
            }
            labelledby="interests-section"
          />
          {formState.interests.length === 0 && (
            <p className="text-sm text-yellow-400">
              Please select at least one interest.
            </p>
          )}
        </FormSection>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormReady}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-bkg-muted disabled:text-text-subtle disabled:cursor-not-allowed disabled:scale-100"
          >
            <SparklesIcon />
            <span>Create my Itinerary</span>
            <ArrowRightIcon />
          </button>
        </div>
      </form>
      {isMapModalOpen && location && (
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setMapModalOpen(false)}
          location={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onSave={handleMapSave}
        />
      )}
    </>
  );
};

const Calendar: React.FC<{ onSelectDate: (date: Date) => void }> = ({
  onSelectDate,
}) => {
  const [date, setDate] = useState(new Date());

  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();

  const daysInMonth = Array.from(
    { length: endOfMonth.getDate() },
    (_, i) => i + 1
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="absolute top-full right-0 mt-2 bg-bkg-surface border border-border-base rounded-lg p-4 shadow-lg z-20 w-72">
      <div className="flex justify-between items-center mb-2">
        <button
          aria-label="Previous month"
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}
        >
          &lt;
        </button>
        <span className="font-semibold">
          {date.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          aria-label="Next month"
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-text-muted mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {daysInMonth.map((day) => {
          const d = new Date(date.getFullYear(), date.getMonth(), day);
          const isPast = d < today;
          const dayOfWeek = d.getDay();
          const isWeekend = [0, 5, 6].includes(dayOfWeek);
          const isDisabled = isPast || !isWeekend;
          return (
            <button
              key={day}
              onClick={() => !isDisabled && onSelectDate(d)}
              disabled={isDisabled}
              className={`p-2 text-sm rounded-full ${isDisabled
                  ? "text-text-subtle opacity-60 cursor-not-allowed"
                  : "hover:bg-primary"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};