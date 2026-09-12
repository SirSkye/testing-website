export interface Photo {
  id: string;
  /** Local path — put the file in /public/photos/... and reference it from there,
   *  e.g. "/photos/trip-1/waterfall.jpg". No remote storage involved. */
  src: string;
  caption?: string;
}

export interface Waypoint {
  id: string;
  name: string;
  /** Display label only, e.g. "12:30 PM". Not used for any math. */
  time: string;
  lng: number;
  lat: number;
  photos: Photo[];
}

export interface Trip {
  id: string;
  name: string;
  /** Ordered — the route is drawn through these in array order. */
  waypoints: Waypoint[];
}
