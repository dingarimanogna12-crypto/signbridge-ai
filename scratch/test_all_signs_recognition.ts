import { gestureEngine, UNRECOGNIZED_SIGN_LABEL } from '../src/services/recognition/gestureEngine';
import { handDetector } from '../src/services/handLandmarkDetector';
import { signVocabulary } from '../src/services/recognition/signVocabulary';

async function runTest() {
  console.log('--- TESTING GESTURE RECOGNITION ACROSS EXPANDED VOCABULARY ---');
  
  const testSigns = [
    // Legacy default signs
    'Hello / Namaste',
    'Yes (Thumbs Up)',
    'No / Pinch',
    'Thank you',
    'Doctor / Medical',
    'Water (W-Sign)',
    'Help / Urgent',
    'Peace / Two',
    'I Love You',
    'Pain / Tension',
    'I Need / Want',
    // Newly enabled vocabulary signs
    'Mother',
    'Father',
    'Number 1 / Point',
    'Food / Eat',
    'Tea / Chai',
    'Where is the bathroom?',
    'Home / House',
    'Stop',
    'Mobile / Phone',
    'I Understand',
    'Today / Now',
    'Rain / Weather',
    'Computer / Laptop'
  ];

  let passed = 0;
  let failed = 0;

  for (const signName of testSigns) {
    await new Promise<void>((resolve) => {
      handDetector.startSimulatedGesture(signName, (result) => {
        if (result) {
          const pred = result.signName;
          const conf = result.confidence;
          const isMatch = pred !== UNRECOGNIZED_SIGN_LABEL && 
            (pred.toLowerCase().includes(signName.toLowerCase().split(' /')[0].split(' (')[0]) ||
             signName.toLowerCase().includes(pred.toLowerCase().split(' /')[0].split(' (')[0]));
          
          if (isMatch) {
            console.log(`[PASS] "${signName}" -> Recognized as "${pred}" (Confidence: ${conf})`);
            passed++;
          } else {
            console.error(`[FAIL] "${signName}" -> Got "${pred}" (Confidence: ${conf})`);
            failed++;
          }
          handDetector.stop();
          resolve();
        }
      });
    });
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testSigns.length} tests.`);
  if (failed === 0) {
    console.log('SUCCESS: All test signs correctly recognized and confirmed!');
    process.exit(0);
  } else {
    console.error('FAILURE: Some signs failed recognition.');
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
