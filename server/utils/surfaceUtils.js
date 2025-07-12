// Turn surface into Hard, Clay, Grass
export const getSurface = (surface) => {
  if (surface.toLowerCase().includes("hard")) {
    return "Hard";
  } else if (surface.toLowerCase().includes("clay")) {
    return "Clay";
  } else {
    return "Grass";
  }
};