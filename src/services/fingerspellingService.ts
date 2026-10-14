import { FingerspellingLetter } from '../types';

// Indian Sign Language (ISL) Finger-spelling reference
// In ISL, alphabetic fingerspelling predominantly uses two hands (similar to BSL/BANZSL tradition in many signs, with common one-handed variations)
export const ISL_FINGERSPELLING_DATA: Record<string, FingerspellingLetter> = {
  A: {
    char: 'A',
    description: 'Touch the tip of the thumb of the non-dominant hand with the index finger of the dominant hand.',
    handshape: 'Dominant index touches non-dominant thumb tip.',
    twoHandedNote: 'Two-handed ISL standard: Left hand open/spread, right index points to left thumb.',
    svgIcon: 'thumb-touch'
  },
  B: {
    char: 'B',
    description: 'Form two touching circles with index fingers and thumbs of both hands joined like eyeglasses or numeral 8.',
    handshape: 'Two touching O-shapes side by side.',
    twoHandedNote: 'Both hands join index and thumb tips, resting next to each other.',
    svgIcon: 'double-circle'
  },
  C: {
    char: 'C',
    description: 'Curve the dominant hand fingers and thumb into a clear C-shape profile.',
    handshape: 'Curved open palm mimicking letter C.',
    twoHandedNote: 'Single hand held sideways to clearly show the arc.',
    svgIcon: 'c-shape'
  },
  D: {
    char: 'D',
    description: 'Dominant index finger upright; dominant thumb and index form a loop, touching the upright non-dominant index finger.',
    handshape: 'Vertical stem with semicircle.',
    twoHandedNote: 'Non-dominant index points vertically; dominant index and thumb form curved bow.',
    svgIcon: 'd-stem'
  },
  E: {
    char: 'E',
    description: 'Touch the tip of the non-dominant index finger with the dominant index finger.',
    handshape: 'Point to second digit (index).',
    twoHandedNote: 'Non-dominant hand flat, dominant index indicates the index fingertip.',
    svgIcon: 'index-touch'
  },
  F: {
    char: 'F',
    description: 'Cross dominant index and middle fingers horizontally across the non-dominant index and middle fingers.',
    handshape: 'Crossed two-finger bars.',
    twoHandedNote: 'Two fingers of dominant hand rest across two fingers of non-dominant hand.',
    svgIcon: 'cross-two'
  },
  G: {
    char: 'G',
    description: 'Both hands clenched in fists, placed one on top of the other with knuckles aligned.',
    handshape: 'Stacked fists.',
    twoHandedNote: 'Dominant fist rests atop non-dominant fist.',
    svgIcon: 'stacked-fists'
  },
  H: {
    char: 'H',
    description: 'Dominant flat hand slides horizontally across the open flat palm of the non-dominant hand.',
    handshape: 'Flat sweep across palm.',
    twoHandedNote: 'Non-dominant palm facing up; dominant fingers stroke from wrist to fingertips.',
    svgIcon: 'palm-stroke'
  },
  I: {
    char: 'I',
    description: 'Touch the tip of the middle finger of the non-dominant hand with the dominant index finger.',
    handshape: 'Point to third digit (middle).',
    twoHandedNote: 'Non-dominant hand spread; dominant index touches middle fingertip.',
    svgIcon: 'middle-touch'
  },
  J: {
    char: 'J',
    description: 'Touch middle fingertip of non-dominant hand, then curve dominant index finger down towards the wrist.',
    handshape: 'Tracing J-hook on palm.',
    twoHandedNote: 'Start at middle finger and trace down curving into palm.',
    svgIcon: 'j-curve'
  },
  K: {
    char: 'K',
    description: 'Dominant index finger bent at knuckle, hooking onto the upright non-dominant index finger.',
    handshape: 'Hooked finger onto vertical finger.',
    twoHandedNote: 'Non-dominant index upright; dominant bent index hooks onto it.',
    svgIcon: 'hook-stem'
  },
  L: {
    char: 'L',
    description: 'Dominant index finger lies across the non-dominant palm, forming a right angle with the non-dominant index.',
    handshape: 'L-shape right angle.',
    twoHandedNote: 'Non-dominant hand forms L with thumb and index, or horizontal index across vertical index.',
    svgIcon: 'l-angle'
  },
  M: {
    char: 'M',
    description: 'Dominant hand places three fingers (index, middle, ring) onto the palm of non-dominant hand.',
    handshape: 'Three fingers touching open palm.',
    twoHandedNote: 'Three fingertips press into open non-dominant palm.',
    svgIcon: 'three-press'
  },
  N: {
    char: 'N',
    description: 'Dominant hand places two fingers (index and middle) onto the palm of non-dominant hand.',
    handshape: 'Two fingers touching open palm.',
    twoHandedNote: 'Two fingertips press into open non-dominant palm.',
    svgIcon: 'two-press'
  },
  O: {
    char: 'O',
    description: 'Touch the tip of the ring finger of the non-dominant hand with the dominant index finger.',
    handshape: 'Point to fourth digit (ring finger).',
    twoHandedNote: 'Non-dominant hand spread; dominant index touches ring fingertip.',
    svgIcon: 'ring-touch'
  },
  P: {
    char: 'P',
    description: 'Dominant index and thumb form a loop touching the tip of the upright non-dominant index finger.',
    handshape: 'Stem with top loop.',
    twoHandedNote: 'Non-dominant index upright; dominant thumb and index form circle at top.',
    svgIcon: 'p-loop'
  },
  Q: {
    char: 'Q',
    description: 'Non-dominant thumb and index form a circle; dominant index finger hooks through it.',
    handshape: 'Circle with tail.',
    twoHandedNote: 'Circle formed by non-dominant hand, dominant index hooks into base.',
    svgIcon: 'q-tail'
  },
  R: {
    char: 'R',
    description: 'Dominant index finger curled over non-dominant palm, forming a small arch or crossed fingers.',
    handshape: 'Hooked finger or crossed fingers.',
    twoHandedNote: 'Dominant bent index touches center of flat non-dominant palm.',
    svgIcon: 'r-hook'
  },
  S: {
    char: 'S',
    description: 'Dominant pinky finger hooks around the non-dominant pinky finger.',
    handshape: 'Interlocked little fingers.',
    twoHandedNote: 'Both little fingers hook together.',
    svgIcon: 'pinky-hook'
  },
  T: {
    char: 'T',
    description: 'Dominant index fingertip touches the edge/side of the non-dominant open palm.',
    handshape: 'T-bar edge contact.',
    twoHandedNote: 'Non-dominant palm vertical; dominant index touches side under thumb.',
    svgIcon: 't-side'
  },
  U: {
    char: 'U',
    description: 'Touch the tip of the pinky (little) finger of the non-dominant hand with the dominant index finger.',
    handshape: 'Point to fifth digit (pinky).',
    twoHandedNote: 'Non-dominant hand spread; dominant index touches little fingertip.',
    svgIcon: 'pinky-touch'
  },
  V: {
    char: 'V',
    description: 'Dominant hand forms a V shape with index and middle fingers, resting on the open non-dominant palm.',
    handshape: 'V-sign on palm.',
    twoHandedNote: 'Dominant V-fingers stand on flat non-dominant palm.',
    svgIcon: 'v-stand'
  },
  W: {
    char: 'W',
    description: 'Both hands interlock fingers pointing upwards, palms facing inwards, resembling W peaks.',
    handshape: 'Interlocked fingers spreading up.',
    twoHandedNote: 'Fingers of both hands interlock and point upward.',
    svgIcon: 'w-peaks'
  },
  X: {
    char: 'X',
    description: 'Dominant index finger crosses over the upright non-dominant index finger to form an X cross.',
    handshape: 'Crossed index fingers.',
    twoHandedNote: 'Both index fingers extended and crossed at midpoints.',
    svgIcon: 'x-cross'
  },
  Y: {
    char: 'Y',
    description: 'Dominant index finger rests in the V-cleft between thumb and index of non-dominant hand.',
    handshape: 'Finger nestled in thumb-index cleft.',
    twoHandedNote: 'Non-dominant hand forms L-shape; dominant index rests in valley.',
    svgIcon: 'y-cleft'
  },
  Z: {
    char: 'Z',
    description: 'Hold non-dominant palm open upright; touch dominant fingertips to palm, then draw a Z motion with dominant index in air.',
    handshape: 'Z-zigzag stroke.',
    twoHandedNote: 'Dominant index traces Z letter against open palm or in signing space.',
    svgIcon: 'z-zigzag'
  }
};

export function getFingerspellingForText(text: string): FingerspellingLetter[] {
  const letters: FingerspellingLetter[] = [];
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  
  for (const char of clean) {
    if (ISL_FINGERSPELLING_DATA[char]) {
      letters.push(ISL_FINGERSPELLING_DATA[char]);
    }
  }
  return letters;
}
