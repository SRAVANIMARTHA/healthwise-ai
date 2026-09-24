/**
 * HealthWise AI — Healthcare Finder Service (Phase 18 & 20)
 *
 * Provides nearby clinic, hospital, and healthcare center search using OpenStreetMap
 * (Overpass API for POI discovery & Nominatim for manual location geocoding).
 *
 * ARCHITECTURAL & PRIVACY PRINCIPLES:
 * 1. Zero Google Maps/Places dependencies: No API keys, zero billing, zero paid subscriptions.
 * 2. Privacy First: Geolocation coordinates are requested ONLY on-demand with user consent.
 *    Coordinates are NEVER stored in databases, cookies, or telemetry.
 * 3. Actual Coordinates: Searches around the user's real browser coordinates (lat, lon, accuracy).
 *    Never substitutes hardcoded city centers (no Hyderabad, Medchal, or Ghatkesar defaults).
 * 4. Multi-Tag Healthcare Discovery: Covers amenity=hospital, clinic, doctors, health_centre,
 *    and healthcare=hospital, clinic, doctor, centre, physician.
 * 5. Deduplication & Distance: Deduplicates by OSM ID and name/spatial proximity; sorts nearest-first.
 * 6. Rate-Limit Respectful: In-memory session cache prevents repeated queries to public Overpass mirrors.
 */

import { HealthcareFacility, HealthcareFacilityType } from '../../types/report';

export interface HealthcareSearchParams {
  latitude?: number;
  longitude?: number;
  cityOrArea?: string;
  radiusKm?: number;
}

// Public Overpass API mirrors for high availability
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// In-memory session cache to respect public OSM rate limits
const sessionQueryCache = new Map<string, HealthcareFacility[]>();

export const healthcareFinderService = {
  /**
   * Search for nearby healthcare facilities using OpenStreetMap Overpass API
   */
  async findNearbyFacilities(params: HealthcareSearchParams): Promise<HealthcareFacility[]> {
    let lat = params.latitude;
    let lon = params.longitude;

    // 1. If city/area string is provided and no coordinates given, geocode via Nominatim
    if (lat === undefined || lon === undefined) {
      if (!params.cityOrArea || !params.cityOrArea.trim()) {
        throw new Error('Please allow location access or enter a city / area name.');
      }

      const geoResult = await this.geocodeArea(params.cityOrArea.trim());
      if (!geoResult) {
        throw new Error(`Could not locate "${params.cityOrArea}". Please check the spelling or enter a nearby city.`);
      }
      lat = geoResult.lat;
      lon = geoResult.lon;
    }

    const radiusKm = params.radiusKm || 5;
    const radiusMeters = Math.round(radiusKm * 1000);

    // Check in-memory session cache (rounded to ~100m to group immediate duplicate calls)
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusKm}`;
    const cached = sessionQueryCache.get(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }

    // 2. Build comprehensive Overpass query covering hospital, clinic, doctor, and health centre tags
    const overpassQuery = `
      [out:json][timeout:20];
      (
        node["amenity"~"^(hospital|clinic|doctors|health_centre)$"](around:${radiusMeters},${lat},${lon});
        way["amenity"~"^(hospital|clinic|doctors|health_centre)$"](around:${radiusMeters},${lat},${lon});
        relation["amenity"~"^(hospital|clinic)$"](around:${radiusMeters},${lat},${lon});
        node["healthcare"~"^(hospital|clinic|doctor|centre|physician)$"](around:${radiusMeters},${lat},${lon});
        way["healthcare"~"^(hospital|clinic|doctor|centre|physician)$"](around:${radiusMeters},${lat},${lon});
        relation["healthcare"~"^(hospital|clinic)$"](around:${radiusMeters},${lat},${lon});
      );
      out center qt 150;
    `;


    let rawElements: any[] = [];
    let lastError: any = null;

    // Try primary and fallback Overpass mirrors if needed
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'HealthWiseAI/1.0 (Public Health Educational Assistant; OSM-Compliant)',
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });

        if (response.ok) {
          const data = await response.json();
          rawElements = data.elements || [];
          break; // Success, break out of endpoint retry loop
        } else {
          lastError = new Error(`Overpass mirror ${endpoint} returned HTTP ${response.status}`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[HealthcareFinder] Failed fetching from ${endpoint}:`, err);
      }
    }

    if (rawElements.length === 0 && lastError) {
      console.warn('[HealthcareFinder] Overpass endpoints unreachable or returned 0 items:', lastError);
    }

    // 3. Process, normalize, and calculate geographic distance
    const rawFacilities: HealthcareFacility[] = [];
    const seenOsmIds = new Set<string>();

    for (const elem of rawElements) {
      const tags = elem.tags || {};
      const elemLat = elem.lat ?? elem.center?.lat;
      const elemLon = elem.lon ?? elem.center?.lon;

      if (elemLat === undefined || elemLon === undefined) continue;

      const osmId = `${elem.type}/${elem.id}`;
      if (seenOsmIds.has(osmId)) continue;
      seenOsmIds.add(osmId);

      const distance = this.calculateDistanceKm(lat, lon, elemLat, elemLon);
      // Ensure result is strictly within radius (with 5% boundary buffer)
      if (distance > radiusKm * 1.05) continue;

      const amenity = (tags.amenity || '').toLowerCase();
      const healthcare = (tags.healthcare || '').toLowerCase();

      // Normalize into standardized HealthcareFacilityType
      let type: HealthcareFacilityType = 'other';
      if (amenity === 'hospital' || healthcare === 'hospital') {
        type = 'hospital';
      } else if (amenity === 'clinic' || healthcare === 'clinic') {
        type = 'clinic';
      } else if (
        amenity === 'doctors' ||
        healthcare === 'doctor' ||
        healthcare === 'physician'
      ) {
        type = 'doctor';
      } else if (
        amenity === 'health_centre' ||
        healthcare === 'centre' ||
        healthcare === 'health_centre' ||
        tags['community:gender'] ||
        tags['healthcare:speciality'] === 'community'
      ) {
        type = 'centre';
      } else {
        type = 'clinic';
      }

      // Name resolution: prefer genuine localized name or official title
      const name =
        tags.name ||
        tags['name:en'] ||
        tags['name:te'] ||
        tags['name:hi'] ||
        tags.operator ||
        (type === 'hospital'
          ? 'Hospital'
          : type === 'doctor'
          ? 'Doctor / Medical Practice'
          : type === 'centre'
          ? 'Community Health Centre'
          : 'Health Clinic');

      // Real address components from OSM tags
      const addressParts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:suburb'] || tags['addr:district'],
        tags['addr:city'],
        tags['addr:postcode'],
      ].filter(Boolean);

      const address =
        tags['addr:full'] ||
        (addressParts.length > 0 ? addressParts.join(', ') : 'Near search area');

      // Phone numbers (never fabricated)
      const phone =
        tags.phone ||
        tags['contact:phone'] ||
        tags['contact:mobile'] ||
        tags['phone:mobile'] ||
        undefined;

      // Website / URL (never fabricated)
      const website =
        tags.website ||
        tags['contact:website'] ||
        tags.url ||
        undefined;

      // Opening hours (never fabricated)
      const openingHours =
        tags.opening_hours ||
        tags['contact:opening_hours'] ||
        undefined;

      // Medical speciality
      const speciality =
        tags['healthcare:speciality'] ||
        tags.speciality ||
        tags['medical_specialty'] ||
        undefined;

      rawFacilities.push({
        id: `osm-${elem.type}-${elem.id}`,
        osmId,
        name,
        type,
        address,
        distanceKm: parseFloat(distance.toFixed(1)),
        phone,
        website,
        openingHours,
        speciality,
        latitude: elemLat,
        longitude: elemLon,
      });
    }

    // 4. Deduplication Strategy (Merge multiple OSM nodes/ways for same physical facility)
    const deduplicatedFacilities: HealthcareFacility[] = [];

    for (const f of rawFacilities) {
      // Check if another facility with identical name is within 150m, or within 25m coordinate proximity
      const existing = deduplicatedFacilities.find((e) => {
        const spatialDist = this.calculateDistanceKm(f.latitude, f.longitude, e.latitude, e.longitude);
        const sameName =
          f.name.toLowerCase().trim() === e.name.toLowerCase().trim() &&
          f.name.toLowerCase() !== 'hospital' &&
          f.name.toLowerCase() !== 'health clinic' &&
          f.name.toLowerCase() !== 'doctor / medical practice';

        return (sameName && spatialDist < 0.15) || spatialDist < 0.025;
      });

      if (existing) {
        // Merge tag enrichment from duplicate (prefer one with phone, address, website)
        if (!existing.phone && f.phone) existing.phone = f.phone;
        if (!existing.website && f.website) existing.website = f.website;
        if (!existing.openingHours && f.openingHours) existing.openingHours = f.openingHours;
        if (existing.address === 'Near search area' && f.address !== 'Near search area') {
          existing.address = f.address;
        }
      } else {
        deduplicatedFacilities.push(f);
      }
    }

    // 5. Sort strictly nearest first (distanceKm ascending)
    const sorted = deduplicatedFacilities.sort(
      (a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)
    );

    // Limit to nearest 100 facilities (generous maximum, preserving nearest)
    const finalResults = sorted.slice(0, 100);

    // Cache in session
    if (finalResults.length > 0) {
      sessionQueryCache.set(cacheKey, finalResults);
    }

    return finalResults;
  },

  /**
   * Geocode city/area string to [lat, lon] using Nominatim (used solely if user denies location permission)
   */
  async geocodeArea(query: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'HealthWiseAI/1.0 (Public Health Educational Assistant; OSM-Compliant)',
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Calculate distance between two coordinates using the Haversine formula (in km)
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

