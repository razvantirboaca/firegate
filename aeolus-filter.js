export function aeolusFilter(input) {
  const distortionPatterns = [
    /I am your savior/i,
    /channeling from Pleiadians/i,
    /bow before/i,
    /galactic federation/i,
    /messiah/i
  ];

  const flagged = distortionPatterns.some((p) => p.test(input));
  return flagged ? "[Filtered: potential distortion]" : input;
}