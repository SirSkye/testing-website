import type { Trip } from "./types";

/**
 * Placeholder trip. Swap the coordinates and photo paths for a real one —
 * the map doesn't care where the data comes from, as long as waypoints are
 * in the order they were visited.
 *
 * Photos are local: drop files into /public/photos/day-hike/ and point
 * `src` at them (e.g. "/photos/day-hike/trailhead.jpg").
 */
export const sampleTrip: Trip = {
  id: "day-hike-1",
  name: "Saturday Hangout",
  waypoints: [
    {
      id: "trailhead",
      name: "For all Ice Cream",
      time: "9:12 AM",
      lng: -80.52252059320764,
      lat: 43.46340399830657,
      photos: [{ id: "p1", src: "/photos/day-hike/icecream.png", caption: "Still half asleep." }],
    },
    {
      id: "ridge",
      name: "Pancakes",
      time: "10:47 AM",
      lng: -80.52127116297756,
      lat: 43.46363658657112,
      photos: [{ id: "p2", src: "/photos/day-hike/pancake.png", caption: "Everyone caught their breath here." }],
    },
    {
      id: "falls",
      name: "Art Musesum",
      time: "12:30 PM",
      lng: -80.52127649057915,
      lat: 43.46445634947231,
      photos: [{ id: "p3", src: "/photos/day-hike/building.png", caption: "Someone lost a sandal in the creek." }],
    },
  ],
};
