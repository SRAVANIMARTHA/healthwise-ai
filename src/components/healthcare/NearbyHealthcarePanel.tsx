/**
 * HealthWise AI — NearbyHealthcarePanel Component (Phase 18 & 20)
 *
 * Provides a clean, highly accurate OpenStreetMap-powered healthcare locator.
 * Uses MapLibre GL with OSM raster tiles (zero Google Maps/Places API, zero billing).
 * Searches around actual browser coordinates, supports filters, pagination, and deduplication.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Search,
  Building2,
  ExternalLink,
  ChevronDown,
  Stethoscope,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Map as MapLibreMap, Marker, Popup, NavigationControl, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { healthcareFinderService } from '../../services/location/healthcare-finder-service';
import { HealthcareFacility, HealthcareFacilityType } from '../../types/report';
import { useTranslation } from '../../hooks/useTranslation';

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

type FilterCategory = 'all' | 'hospital' | 'clinic' | 'doctor';

export const NearbyHealthcarePanel: React.FC = () => {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [cityInput, setCityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter facilities based on selected category
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'hospital') return f.type === 'hospital';
      if (activeFilter === 'clinic') return f.type === 'clinic' || f.type === 'centre';
      if (activeFilter === 'doctor') return f.type === 'doctor';
      return true;
    });
  }, [facilities, activeFilter]);

  // Facilities displayed in the list below the map
  const displayedFacilities = useMemo(() => {
    return filteredFacilities.slice(0, visibleCount);
  }, [filteredFacilities, visibleCount]);

  // Marker style & label helper
  const getMarkerConfig = (type: HealthcareFacilityType) => {
    switch (type) {
      case 'hospital':
        return { bg: 'bg-rose-600', text: 'H', label: t('report', 'hospitalTag') };
      case 'clinic':
        return { bg: 'bg-teal-600', text: '+', label: t('report', 'clinicTag') };
      case 'doctor':
        return { bg: 'bg-sky-600', text: 'Dr', label: t('report', 'doctorTag') };
      case 'centre':
        return { bg: 'bg-purple-600', text: 'C', label: t('report', 'centreTag') };
      default:
        return { bg: 'bg-slate-700', text: '+', label: t('report', 'otherHealthcareTag') };
    }
  };

  // Initialize or update MapLibre GL map when coordinates or filtered facilities change
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!userCoords && filteredFacilities.length === 0) return;

    const centerLat = userCoords ? userCoords.lat : filteredFacilities[0]?.latitude ?? 0;
    const centerLon = userCoords ? userCoords.lon : filteredFacilities[0]?.longitude ?? 0;

    // Create map instance if not already initialized
    if (!mapInstanceRef.current) {
      try {
        const map = new MapLibreMap({
          container: mapContainerRef.current,
          style: OSM_STYLE,
          center: [centerLon, centerLat],
          zoom: 13,
        });

        map.addControl(new NavigationControl({ showCompass: true }), 'top-right');
        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('[NearbyHealthcarePanel] MapLibre GL init error:', err);
      }
    } else {
      mapInstanceRef.current.setCenter([centerLon, centerLat]);
    }

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;
    if (!map) return;

    // Add user location marker with pulse effect
    if (userCoords) {
      try {
        const userEl = document.createElement('div');
        userEl.className =
          'w-5 h-5 rounded-full bg-teal-600 border-2 border-white shadow-md ring-4 ring-teal-300/60 animate-pulse';
        userEl.title = 'Your Search Location';

        const userMarker = new Marker({ element: userEl })
          .setLngLat([userCoords.lon, userCoords.lat])
          .setPopup(
            new Popup({ offset: 12 }).setHTML(
              `<div class="p-1 font-bold text-xs text-slate-800">Your Location ${
                userAccuracy ? `(±${userAccuracy}m)` : ''
              }</div>`
            )
          )
          .addTo(map);

        markersRef.current.push(userMarker);
      } catch (err) {
        console.warn('[NearbyHealthcarePanel] User marker error:', err);
      }
    }

    // Add facility markers (all filtered facilities rendered on the map)
    filteredFacilities.forEach((f) => {
      try {
        const markerConfig = getMarkerConfig(f.type);
        const isSelected = selectedFacilityId === f.id;

        const el = document.createElement('div');
        el.className = `w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shadow-md cursor-pointer border-2 transition-transform hover:scale-110 ${
          isSelected ? 'border-amber-400 scale-125 ring-2 ring-amber-300' : 'border-white'
        } ${markerConfig.bg}`;
        el.innerText = markerConfig.text;
        el.title = f.name;

        const popupHtml = `
          <div class="p-1.5 text-xs space-y-1 max-w-[200px]">
            <strong class="text-slate-900 block font-bold leading-tight">${f.name}</strong>
            <span class="text-slate-500 block text-[11px]">${f.address}</span>
            ${f.distanceKm ? `<span class="text-teal-700 font-semibold block text-[11px]">~${f.distanceKm} km</span>` : ''}
            ${f.phone ? `<a href="tel:${f.phone}" class="text-teal-600 underline block text-[11px] font-medium">${f.phone}</a>` : ''}
          </div>
        `;

        const popup = new Popup({ offset: 14 }).setHTML(popupHtml);

        const marker = new Marker({ element: el })
          .setLngLat([f.longitude, f.latitude])
          .setPopup(popup)
          .addTo(map);

        // Clicking marker selects facility card and scrolls into view
        el.addEventListener('click', () => {
          setSelectedFacilityId(f.id);
          const card = cardRefs.current.get(f.id);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

        markersRef.current.push(marker);
      } catch (err) {
        console.warn('[NearbyHealthcarePanel] Facility marker error:', err);
      }
    });
  }, [userCoords, filteredFacilities, selectedFacilityId]);

  // Teardown map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Search via browser Geolocation (prompted only on demand)
  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setIsLoading(false);
      setErrorMessage(t('report', 'locationGenericError'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);


          setUserCoords({ lat, lon });
          setUserAccuracy(accuracy);

          const results = await healthcareFinderService.findNearbyFacilities({
            latitude: lat,
            longitude: lon,
            radiusKm: 5,
          });

          setFacilities(results);
          setVisibleCount(10);
          setHasSearched(true);
        } catch (err: any) {
          setErrorMessage(err.message || t('report', 'locationGenericError'));
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage(t('report', 'locationDeniedError'));
        } else {
          setErrorMessage(t('report', 'locationGenericError'));
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Search by City/Area (manual fallback when geolocation is denied or requested)
  const handleSearchByArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setUserAccuracy(null);

    try {
      const results = await healthcareFinderService.findNearbyFacilities({
        cityOrArea: cityInput.trim(),
        radiusKm: 5,
      });

      if (results.length > 0) {
        setUserCoords({ lat: results[0].latitude, lon: results[0].longitude });
      }

      setFacilities(results);
      setVisibleCount(10);
      setHasSearched(true);
    } catch (err: any) {
      setErrorMessage(err.message || t('report', 'locationGenericError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Pan map to facility and open popup when card is clicked
  const handleFocusFacility = (facility: HealthcareFacility) => {
    setSelectedFacilityId(facility.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [facility.longitude, facility.latitude],
        zoom: 14,
        essential: true,
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {t('report', 'locatorBadge')}
          </span>
          <h3 className="text-lg font-bold text-slate-900">{t('report', 'locatorTitle')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('report', 'locatorSubtitle')}</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          <span>{t('report', 'useCurrentLocation')}</span>
        </button>

        <form onSubmit={handleSearchByArea} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={t('report', 'searchAreaPlaceholder')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={!cityInput.trim() || isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors"
          >
            {t('report', 'searchBtn')}
          </button>
        </form>
      </div>

      {/* Location accuracy indicators */}
      {userAccuracy !== null && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] animate-in fade-in">
          <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
            <Navigation className="w-3 h-3 text-teal-600" />
            {t('report', 'locationAccuracy')}: ±{userAccuracy} m
          </span>
          {userAccuracy > 500 && (
            <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {t('report', 'locationAccuracyApproxWarning')}
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">{t('report', 'queryingOsm')}</span>
        </div>
      )}

      {/* Interactive Map Container */}
      {(hasSearched || userCoords) && (
        <div className="space-y-2 animate-in fade-in">
          <div
            ref={mapContainerRef}
            className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner"
            role="region"
            aria-label="OpenStreetMap Interactive Healthcare Map"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> {t('report', 'hospitalTag')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> {t('report', 'clinicTag')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> {t('report', 'doctorTag')}
              </span>
            </div>
            <span>MapLibre GL • OpenStreetMap</span>
          </div>
        </div>
      )}

      {/* Results Header, Filters & Result List */}
      {!isLoading && hasSearched && (
        <div className="space-y-4 pt-2">
          {/* Header with verified facility count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="text-xs font-bold text-slate-800">
              {facilities.length > 0 ? (
                <span>
                  {facilities.length} {t('report', 'facilitiesFoundWithin')} 5 km
                </span>
              ) : (
                <span className="text-slate-500">0 facilities found within 5 km</span>
              )}
            </div>

            {/* Category Filters */}
            {facilities.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setVisibleCount(10);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'all'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('report', 'filterAllHealthcare')} ({facilities.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('hospital');
                    setVisibleCount(10);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'hospital'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('report', 'filterHospitals')} (
                  {facilities.filter((f) => f.type === 'hospital').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('clinic');
                    setVisibleCount(10);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'clinic'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('report', 'filterClinics')} (
                  {facilities.filter((f) => f.type === 'clinic' || f.type === 'centre').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('doctor');
                    setVisibleCount(10);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'doctor'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('report', 'filterDoctors')} (
                  {facilities.filter((f) => f.type === 'doctor').length})
                </button>
              </div>
            )}
          </div>

          {/* Facilities Grid */}
          {displayedFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedFacilities.map((f, idx) => {
                const config = getMarkerConfig(f.type);
                const isSelected = selectedFacilityId === f.id;

                return (
                  <div
                    key={f.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(f.id, el);
                      else cardRefs.current.delete(f.id);
                    }}
                    onClick={() => handleFocusFacility(f)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-teal-50/50 border-teal-400 ring-2 ring-teal-200/50 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-teal-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                          <span className="text-slate-400 text-xs mr-1 font-semibold">{idx + 1}.</span>
                          {f.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white flex-shrink-0 ${config.bg}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{f.address}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {f.distanceKm !== undefined && (
                          <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                            ~{f.distanceKm} {t('report', 'kmAway')}
                          </span>
                        )}

                        {f.speciality && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <Stethoscope className="w-2.5 h-2.5 text-teal-600" />
                            {f.speciality}
                          </span>
                        )}
                      </div>

                      {/* Opening hours display */}
                      <div className="mt-2 text-[11px] flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{f.openingHours || t('report', 'hoursUnavailable')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      {f.phone ? (
                        <a
                          href={`tel:${f.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-slate-700 hover:text-teal-700 font-medium"
                        >
                          <Phone className="w-3 h-3 text-teal-600 flex-shrink-0" />
                          <span>{f.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">{t('report', 'contactDirectory')}</span>
                      )}

                      <div className="flex items-center gap-3">
                        {f.website && (
                          <a
                            href={f.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-600 hover:text-teal-700"
                            title="Official Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <a
                          href={
                            userCoords
                              ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords.lat}%2C${userCoords.lon}%3B${f.latitude}%2C${f.longitude}`
                              : `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${f.latitude}%2C${f.longitude}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold text-xs"
                        >
                          <span>{t('report', 'directions')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
              No facilities found matching this filter category.
            </div>
          )}

          {/* Incremental Display / Load More Button */}
          {filteredFacilities.length > visibleCount && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-semibold transition-all border border-slate-200"
              >
                <span>
                  {t('report', 'loadMore')} ({t('report', 'showingCount')} {displayedFacilities.length} of{' '}
                  {filteredFacilities.length})
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

