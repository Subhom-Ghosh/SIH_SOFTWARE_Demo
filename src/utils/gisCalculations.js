import * as turf from '@turf/turf';

export const SQ_METERS_PER_ACRE = 4046.8564224;
export const HECTARES_PER_ACRE = 0.404686;
export const GUNTHAS_PER_ACRE = 40;
export const BIGHA_PER_ACRE = 1.6133; // Standard Pucca Bigha in North India

/**
 * Calculates accurate polygon area in Acres, Hectares, SqM, Bigha, Guntha
 */
export function calculatePolygonMetrics(polygon) {
  try {
    const turfPoly = turf.polygon(polygon.coordinates);
    const areaSqM = turf.area(turfPoly);
    const areaAcre = Number((areaSqM / SQ_METERS_PER_ACRE).toFixed(4));
    const areaHectare = Number((areaSqM / 10000).toFixed(4));
    const areaBigha = Number((areaAcre * BIGHA_PER_ACRE).toFixed(2));
    const areaGuntha = Number((areaAcre * GUNTHAS_PER_ACRE).toFixed(2));
    const perimeterMeters = Number(turf.length(turf.polygonToLine(turfPoly), { units: 'meters' }).toFixed(2));
    const centroid = turf.centroid(turfPoly);
    const [centerLng, centerLat] = centroid.geometry.coordinates;

    return {
      areaSqM: Math.round(areaSqM * 100) / 100,
      areaAcre,
      areaHectare,
      areaBigha,
      areaGuntha,
      perimeterMeters,
      centerLat,
      centerLng,
    };
  } catch (err) {
    console.error('Error calculating polygon metrics:', err);
    return {
      areaSqM: 0,
      areaAcre: 0,
      areaHectare: 0,
      areaBigha: 0,
      areaGuntha: 0,
      perimeterMeters: 0,
      centerLat: 0,
      centerLng: 0,
    };
  }
}

/**
 * Compares two polygon geometries (Cadastral vs Surveyed) and calculates:
 * - Area difference (absolute & %)
 * - Spatial Overlap / IoU (Intersection over Union)
 * - Boundary Hausdorff / vertex shift distance
 * - Encroachment polygon (difference)
 * - Mismatch severity & classification
 */
export function compareParcels(cadastralGeom, surveyedGeom, recordedAreaAcre) {
  try {
    const cadPoly = turf.polygon(cadastralGeom.coordinates);
    const surPoly = turf.polygon(surveyedGeom.coordinates);

    const cadAreaSqM = turf.area(cadPoly);
    const surAreaSqM = turf.area(surPoly);

    const surveyedAreaAcre = Number((surAreaSqM / SQ_METERS_PER_ACRE).toFixed(4));
    const diffAreaAcre = Number((surveyedAreaAcre - recordedAreaAcre).toFixed(4));
    const diffPercent = recordedAreaAcre > 0 ? Number(((diffAreaAcre / recordedAreaAcre) * 100).toFixed(2)) : 0;

    // Intersection
    const intersection = turf.intersect(turf.featureCollection([cadPoly, surPoly]));
    const interAreaSqM = intersection ? turf.area(intersection) : 0;

    // Union
    const unionPoly = turf.union(turf.featureCollection([cadPoly, surPoly]));
    const unionAreaSqM = unionPoly ? turf.area(unionPoly) : cadAreaSqM + surAreaSqM;

    // IoU (0 to 100%)
    const iouPercent = unionAreaSqM > 0 ? Number(((interAreaSqM / unionAreaSqM) * 100).toFixed(2)) : 0;

    // Difference / Encroachment (Surveyed area outside Cadastral boundary)
    let encroachmentGeom;
    const diffPoly = turf.difference(turf.featureCollection([surPoly, cadPoly]));
    if (diffPoly && diffPoly.geometry && diffPoly.geometry.type === 'Polygon') {
      encroachmentGeom = diffPoly.geometry;
    }

    // Determine status & severity
    const absDiffPercent = Math.abs(diffPercent);
    let mismatchType = 'None';
    let severity = 'Low';

    if (absDiffPercent > 15 || iouPercent < 80) {
      severity = 'Critical';
    } else if (absDiffPercent > 8 || iouPercent < 90) {
      severity = 'High';
    } else if (absDiffPercent > 3 || iouPercent < 95) {
      severity = 'Medium';
    } else {
      severity = 'Low';
    }

    if (encroachmentGeom && (surAreaSqM - interAreaSqM) > 150) {
      mismatchType = 'Possible Encroachment';
    } else if (iouPercent < 92 && absDiffPercent <= 5) {
      mismatchType = 'Boundary Mismatch';
    } else if (absDiffPercent > 3) {
      mismatchType = 'Area Mismatch';
    }

    return {
      recordedAreaAcre,
      surveyedAreaAcre,
      cadAreaSqM: Math.round(cadAreaSqM),
      surAreaSqM: Math.round(surAreaSqM),
      diffAreaAcre,
      diffPercent,
      iouPercent,
      overlapPercent: cadAreaSqM > 0 ? Number(((interAreaSqM / cadAreaSqM) * 100).toFixed(2)) : 100,
      mismatchType,
      severity,
      encroachmentGeom,
      isMismatch: severity !== 'Low' || mismatchType !== 'None',
    };
  } catch (err) {
    console.error('Error during parcel comparison:', err);
    return {
      recordedAreaAcre,
      surveyedAreaAcre: recordedAreaAcre,
      cadAreaSqM: 0,
      surAreaSqM: 0,
      diffAreaAcre: 0,
      diffPercent: 0,
      iouPercent: 100,
      overlapPercent: 100,
      mismatchType: 'None',
      severity: 'Low',
      encroachmentGeom: undefined,
      isMismatch: false,
    };
  }
}

/**
 * Format Acre to local unit string (Acres + Bigha + Guntha)
 */
export function formatAreaMultiUnit(acre) {
  const bigha = (acre * BIGHA_PER_ACRE).toFixed(2);
  const guntha = (acre * GUNTHAS_PER_ACRE).toFixed(1);
  return `${acre.toFixed(2)} Acres (${bigha} Bigha / ${guntha} Guntha)`;
}
