import type { Feature, MultiPolygon, Point, Polygon } from "@turf/turf";
import {
    booleanPointInPolygon,
    pointToLineDistance,
    polygon as makePolygon,
    polygonToLineString,
  } from "@turf/turf";
import type { LineString } from "geojson";
  

/**
 * used for determining the shortest distance from a point to a polygon.
 */
interface IODistanceToPolygonInput {
  point: Point;
  polygon: Polygon | MultiPolygon;
}
  

/**
 * get the distance in meters from a point to the edges of a polygon. negative values indicate a point inside the polygon.
 * @param param0 the point and polygon to measure.
 * @returns the distance.
 */
export function distanceToPolygon_direct({ point, polygon }: IODistanceToPolygonInput): number {
  let distance: number;

  if (polygon.type === "MultiPolygon") {
    distance = polygon.coordinates
      .map(coords => distanceToPolygon_direct({ point, polygon: makePolygon(coords).geometry! }))
      .reduce((smallest, current) => (current < smallest ? current : smallest));
  } else {
    if (polygon.coordinates.length > 1) {
      // Has holes
      const [exteriorDistance, ...interiorDistances] = polygon.coordinates.map(coords =>
        distanceToPolygon_direct({ point, polygon: makePolygon([coords]).geometry! })
      );

      if (exteriorDistance < 0) {
        // point is inside the exterior polygon shape
        const smallestInteriorDistance = interiorDistances.reduce(
          (smallest, current) => (current < smallest ? current : smallest)
        );

        if (smallestInteriorDistance < 0) {
          // point is inside one of the holes (therefore not actually inside this shape)
          distance = smallestInteriorDistance * -1;
        } else {
          // find which is closer, the distance to the hole or the distance
          // to the edge of the exterior, and set that as the inner distance.
          distance =
            smallestInteriorDistance < exteriorDistance * -1
              ? smallestInteriorDistance * -1
              : exteriorDistance;
        }
      } else {
        distance = exteriorDistance;
      }
    } else {
      // The actual distance operation - on a normal, hole-less polygon (converted to meters)
      distance = pointToLineDistance(point, (polygonToLineString(polygon) as Feature<LineString>)) * 1000;

      if (booleanPointInPolygon(point, polygon)) {
        distance = distance * -1;
      }
    }
  }

  return distance;
}