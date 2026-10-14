const fs = require('fs');
const path = require('path');

// 1. Read existing centroids
const centroidsPath = path.join(__dirname, '../src/services/recognition/trained_centroids.json');
const existingCentroids = JSON.parse(fs.readFileSync(centroidsPath, 'utf8'));
const existingMap = new Map();
for (const c of existingCentroids) {
  existingMap.set(c.id, c);
}

// 2. Read sign vocabulary to get all 47 signs
const vocabFile = fs.readFileSync(path.join(__dirname, '../src/services/recognition/signVocabulary.ts'), 'utf8');

// Helper to generate normalized 21 landmarks based on canonical handshape
function generateLandmarksForShape(shape) {
  const lm = [];
  // 0: Wrist
  lm.push({ x: 0, y: 0, z: 0 });

  // Baseline MCPs
  const thumbCmc = { x: -0.30, y: -0.25, z: 0.05 };
  const thumbMcp = { x: -0.55, y: -0.50, z: 0.08 };
  const indexMcp = { x: -0.35, y: -0.90, z: 0 };
  const middleMcp = { x: 0, y: -1.0, z: 0 };
  const ringMcp = { x: 0.35, y: -0.95, z: 0 };
  const pinkyMcp = { x: 0.65, y: -0.85, z: 0 };

  // Determine extensions
  let thumbExt = true;
  let indexExt = true;
  let middleExt = true;
  let ringExt = true;
  let pinkyExt = true;

  if (shape === 'index_1') {
    thumbExt = false;
    indexExt = true;
    middleExt = false;
    ringExt = false;
    pinkyExt = false;
  } else if (shape === 'v_peace') {
    thumbExt = false;
    indexExt = true;
    middleExt = true;
    ringExt = false;
    pinkyExt = false;
  } else if (shape === 'w_water') {
    thumbExt = false;
    indexExt = true;
    middleExt = true;
    ringExt = true;
    pinkyExt = false;
  } else if (shape === 'thumbs_up') {
    thumbExt = true;
    indexExt = false;
    middleExt = false;
    ringExt = false;
    pinkyExt = false;
  } else if (shape === 'pinch_o') {
    thumbExt = true;
    indexExt = false;
    middleExt = false;
    ringExt = false;
    pinkyExt = false;
  } else if (shape === 'ily') {
    thumbExt = true;
    indexExt = true;
    middleExt = false;
    ringExt = false;
    pinkyExt = true;
  } else if (shape === 'fist') {
    thumbExt = false;
    indexExt = false;
    middleExt = false;
    ringExt = false;
    pinkyExt = false;
  } else if (shape === 'pinky_up') {
    thumbExt = false;
    indexExt = false;
    middleExt = false;
    ringExt = false;
    pinkyExt = true;
  } else if (shape === 'phone_y') {
    thumbExt = true;
    indexExt = false;
    middleExt = false;
    ringExt = false;
    pinkyExt = true;
  }

  // Thumb (1, 2, 3, 4)
  lm.push(thumbCmc);
  lm.push(thumbMcp);
  if (shape === 'thumbs_up') {
    lm.push({ x: -0.35, y: -0.85, z: 0.15 });
    lm.push({ x: -0.38, y: -1.25, z: 0.22 });
  } else if (shape === 'pinch_o') {
    // Touch index tip
    lm.push({ x: -0.42, y: -0.75, z: 0.12 });
    lm.push({ x: -0.32, y: -1.05, z: 0.16 });
  } else if (thumbExt) {
    lm.push({ x: -0.80, y: -0.80, z: 0.10 });
    lm.push({ x: -1.05, y: -1.05, z: 0.12 });
  } else {
    // Curled over fist
    lm.push({ x: -0.35, y: -0.65, z: 0.15 });
    lm.push({ x: -0.10, y: -0.70, z: 0.20 });
  }

  // Index (5, 6, 7, 8)
  lm.push(indexMcp);
  if (shape === 'pinch_o') {
    lm.push({ x: -0.38, y: -1.15, z: 0.05 });
    lm.push({ x: -0.35, y: -1.18, z: 0.12 });
    lm.push({ x: -0.32, y: -1.05, z: 0.16 });
  } else if (indexExt) {
    lm.push({ x: -0.40, y: -1.35, z: -0.05 });
    lm.push({ x: -0.44, y: -1.75, z: -0.08 });
    lm.push({ x: -0.48, y: -2.15, z: -0.10 });
  } else {
    // Curled
    lm.push({ x: -0.36, y: -1.15, z: 0.12 });
    lm.push({ x: -0.30, y: -1.05, z: 0.22 });
    lm.push({ x: -0.25, y: -0.85, z: 0.18 });
  }

  // Middle (9, 10, 11, 12)
  lm.push(middleMcp);
  if (middleExt) {
    lm.push({ x: 0, y: -1.45, z: -0.05 });
    lm.push({ x: 0, y: -1.85, z: -0.08 });
    lm.push({ x: 0, y: -2.25, z: -0.10 });
  } else {
    // Curled
    lm.push({ x: 0, y: -1.25, z: 0.12 });
    lm.push({ x: 0, y: -1.10, z: 0.22 });
    lm.push({ x: 0, y: -0.88, z: 0.18 });
  }

  // Ring (13, 14, 15, 16)
  lm.push(ringMcp);
  if (ringExt) {
    lm.push({ x: 0.40, y: -1.40, z: -0.05 });
    lm.push({ x: 0.44, y: -1.80, z: -0.08 });
    lm.push({ x: 0.48, y: -2.20, z: -0.10 });
  } else {
    // Curled
    lm.push({ x: 0.34, y: -1.20, z: 0.12 });
    lm.push({ x: 0.28, y: -1.05, z: 0.22 });
    lm.push({ x: 0.22, y: -0.85, z: 0.18 });
  }

  // Pinky (17, 18, 19, 20)
  lm.push(pinkyMcp);
  if (pinkyExt) {
    lm.push({ x: 0.76, y: -1.28, z: -0.05 });
    lm.push({ x: 0.84, y: -1.62, z: -0.08 });
    lm.push({ x: 0.92, y: -1.96, z: -0.10 });
  } else {
    // Curled
    lm.push({ x: 0.60, y: -1.10, z: 0.12 });
    lm.push({ x: 0.50, y: -0.98, z: 0.20 });
    lm.push({ x: 0.40, y: -0.80, z: 0.16 });
  }

  return lm;
}

// 47 sign metadata map
const signShapes = {
  'sign-hello': 'open_5',
  'sign-thank-you': 'open_5',
  'sign-please': 'open_5',
  'sign-sorry': 'fist',
  'sign-welcome': 'open_5',
  'sign-good-morning': 'thumbs_up',
  'sign-ily': 'ily',
  'sign-mother': 'open_5',
  'sign-father': 'open_5',
  'sign-brother': 'index_1',
  'sign-sister': 'index_1',
  'sign-friend': 'index_1',
  'sign-number-1': 'index_1',
  'sign-peace': 'v_peace',
  'sign-time-clock': 'index_1',
  'sign-today': 'open_5',
  'sign-tomorrow': 'index_1',
  'sign-home': 'open_5',
  'sign-need': 'open_5',
  'sign-sleep': 'open_5',
  'sign-bathroom': 'pinky_up',
  'sign-yes': 'thumbs_up',
  'sign-no': 'pinch_o',
  'sign-feel-happy': 'open_5',
  'sign-feel-sad': 'open_5',
  'sign-question-where': 'open_5',
  'sign-travel-bus': 'fist',
  'sign-travel-train': 'v_peace',
  'sign-stop': 'open_5',
  'sign-water': 'w_water',
  'sign-food-eat': 'pinch_o',
  'sign-tea': 'pinch_o',
  'sign-money-price': 'pinch_o',
  'sign-buy-pay': 'open_5',
  'sign-classroom': 'open_5',
  'sign-teacher': 'open_5',
  'sign-understand': 'index_1',
  'sign-weather-rain': 'open_5',
  'sign-play-game': 'phone_y',
  'sign-doctor': 'v_peace',
  'sign-pain': 'index_1',
  'sign-help-urgent': 'fist',
  'sign-hospital': 'index_1',
  'sign-medicine': 'v_peace',
  'sign-tech-mobile': 'phone_y',
  'sign-tech-computer': 'open_5',
  'sign-tech-message': 'fist'
};

const signNames = {
  'sign-hello': 'Hello / Namaste',
  'sign-thank-you': 'Thank you',
  'sign-please': 'Please',
  'sign-sorry': 'Sorry',
  'sign-welcome': 'Welcome / Nice to meet you',
  'sign-good-morning': 'Good Morning',
  'sign-ily': 'I Love You',
  'sign-mother': 'Mother',
  'sign-father': 'Father',
  'sign-brother': 'Brother',
  'sign-sister': 'Sister',
  'sign-friend': 'Friend',
  'sign-number-1': 'Number 1 / Point',
  'sign-peace': 'Number 2 / Peace',
  'sign-time-clock': 'Time / Clock',
  'sign-today': 'Today / Now',
  'sign-tomorrow': 'Tomorrow',
  'sign-home': 'Home / House',
  'sign-need': 'I Need / Want',
  'sign-sleep': 'Sleep / Tired',
  'sign-bathroom': 'Where is the bathroom?',
  'sign-yes': 'Yes (Thumbs Up)',
  'sign-no': 'No / Pinch',
  'sign-feel-happy': 'Happy / Glad',
  'sign-feel-sad': 'Sad / Unhappy',
  'sign-question-where': 'Where? / Location Question',
  'sign-travel-bus': 'Bus / Bus stand',
  'sign-travel-train': 'Train / Railway station',
  'sign-stop': 'Stop',
  'sign-water': 'Water (W-Sign)',
  'sign-food-eat': 'Food / Eat',
  'sign-tea': 'Tea / Chai',
  'sign-money-price': 'How much money? / Price',
  'sign-buy-pay': 'Buy / Pay',
  'sign-classroom': 'Classroom / College',
  'sign-teacher': 'Teacher / Instructor',
  'sign-understand': 'I Understand',
  'sign-weather-rain': 'Rain / Weather',
  'sign-play-game': 'Play / Game',
  'sign-doctor': 'Doctor / Medical',
  'sign-pain': 'Pain / Hurt',
  'sign-help-urgent': 'Help / Urgent',
  'sign-hospital': 'Where is the hospital?',
  'sign-medicine': 'Medicine / Tablet',
  'sign-tech-mobile': 'Mobile / Phone',
  'sign-tech-computer': 'Computer / Laptop',
  'sign-tech-message': 'Message / SMS / Text'
};

const signCategories = {
  'sign-hello': 'Greetings',
  'sign-thank-you': 'Greetings',
  'sign-please': 'Greetings',
  'sign-sorry': 'Greetings',
  'sign-welcome': 'Greetings',
  'sign-good-morning': 'Greetings',
  'sign-ily': 'Family',
  'sign-mother': 'Family',
  'sign-father': 'Family',
  'sign-brother': 'Family',
  'sign-sister': 'Family',
  'sign-friend': 'Family',
  'sign-number-1': 'Numbers',
  'sign-peace': 'Numbers',
  'sign-time-clock': 'Numbers',
  'sign-today': 'Numbers',
  'sign-tomorrow': 'Numbers',
  'sign-home': 'Everyday',
  'sign-need': 'Everyday',
  'sign-sleep': 'Everyday',
  'sign-bathroom': 'Everyday',
  'sign-yes': 'Questions',
  'sign-no': 'Questions',
  'sign-feel-happy': 'Questions',
  'sign-feel-sad': 'Questions',
  'sign-question-where': 'Questions',
  'sign-travel-bus': 'Travel',
  'sign-travel-train': 'Travel',
  'sign-stop': 'Travel',
  'sign-water': 'Food',
  'sign-food-eat': 'Food',
  'sign-tea': 'Food',
  'sign-money-price': 'Money',
  'sign-buy-pay': 'Money',
  'sign-classroom': 'Education',
  'sign-teacher': 'Education',
  'sign-understand': 'Education',
  'sign-weather-rain': 'Hobbies',
  'sign-play-game': 'Hobbies',
  'sign-doctor': 'Health',
  'sign-pain': 'Health',
  'sign-help-urgent': 'Health',
  'sign-hospital': 'Health',
  'sign-medicine': 'Health',
  'sign-tech-mobile': 'Technology',
  'sign-tech-computer': 'Technology',
  'sign-tech-message': 'Technology'
};

const allCentroids = [];

for (const [id, shape] of Object.entries(signShapes)) {
  if (existingMap.has(id)) {
    allCentroids.push(existingMap.get(id));
  } else {
    allCentroids.push({
      id: id,
      name: signNames[id] || id,
      type: id.includes('dynamic') || ['sign-food-eat', 'sign-tea', 'sign-money-price', 'sign-home', 'sign-classroom', 'sign-teacher', 'sign-weather-rain', 'sign-hospital', 'sign-medicine', 'sign-tech-computer', 'sign-tech-message', 'sign-stop', 'sign-travel-bus', 'sign-travel-train', 'sign-welcome'].includes(id) ? 'dynamic_sequence' : 'static_posture',
      category: signCategories[id] || 'General',
      landmarks: generateLandmarksForShape(shape),
      threshold: 0.42
    });
  }
}

fs.writeFileSync(centroidsPath, JSON.stringify(allCentroids, null, 2), 'utf8');
console.log('Successfully wrote', allCentroids.length, 'centroids to', centroidsPath);
