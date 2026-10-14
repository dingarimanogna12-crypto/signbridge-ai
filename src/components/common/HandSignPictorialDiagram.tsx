import React from 'react';
import { 
  MapPin, 
  Activity, 
  Compass, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export type HandshapeDiagramType = 
  | 'open_5'
  | 'index_1'
  | 'v_peace'
  | 'two_parallel'
  | 'w_water'
  | 'thumbs_up'
  | 'pinch_o'
  | 'ily'
  | 'clenched_fist'
  | 'pinky_up'
  | 'phone_y'
  | 'roof_hands'
  | 'flat_palm'
  | 'cupped_hands';

interface HandSignPictorialDiagramProps {
  handshapeDescription: string;
  bodyAnchor: string;
  movementTrajectory: string;
  signGloss?: string;
  signName?: string;
  stageNumber?: number;
  twoHanded?: boolean;
  palmOrientation?: string;
}

// Helper to deduce canonical handshape type from text descriptions
export function detectHandshapeType(text: string, gloss?: string, name?: string): HandshapeDiagramType {
  const combined = `${text} ${gloss || ''} ${name || ''}`.toLowerCase();
  
  if (combined.includes('ily') || combined.includes('love')) return 'ily';
  if (combined.includes('thumb upright') || combined.includes('thumbs up') || combined.includes('yes')) return 'thumbs_up';
  if (combined.includes('w-') || combined.includes('water') || combined.includes('3-finger') || combined.includes('w hand')) return 'w_water';
  if (combined.includes('peace') || combined.includes('v-shape') || combined.includes('two') || combined.includes('number 2')) return 'v_peace';
  if (combined.includes('pulse') || combined.includes('doctor') || combined.includes('two-finger') || combined.includes('parallel')) return 'two_parallel';
  if (combined.includes('pinch') || combined.includes('tea') || combined.includes('chai') || combined.includes('food') || combined.includes('eat') || combined.includes('money') || combined.includes('flat-o') || combined.includes('o-hand')) return 'pinch_o';
  if (combined.includes('pinky') || combined.includes('toilet') || combined.includes('bathroom')) return 'pinky_up';
  if (combined.includes('phone') || combined.includes('mobile') || combined.includes('y-hand') || combined.includes('ear simulating')) return 'phone_y';
  if (combined.includes('roof') || combined.includes('home') || combined.includes('house') || combined.includes('tent')) return 'roof_hands';
  if (combined.includes('fist') || combined.includes('help') || combined.includes('urgent') || combined.includes('sorry') || combined.includes('a-hand')) return 'clenched_fist';
  if (combined.includes('index finger') || combined.includes('number 1') || combined.includes('point') || combined.includes('time') || combined.includes('clock') || combined.includes('understand')) return 'index_1';
  if (combined.includes('stop') || combined.includes('flat palm') || combined.includes('chop') || combined.includes('thank')) return 'flat_palm';
  if (combined.includes('cupped') || combined.includes('typing') || combined.includes('computer') || combined.includes('need') || combined.includes('message')) return 'cupped_hands';
  
  return 'open_5';
}

export const HandSignPictorialDiagram: React.FC<HandSignPictorialDiagramProps> = ({
  handshapeDescription,
  bodyAnchor,
  movementTrajectory,
  signGloss = 'ISL SIGN',
  signName = '',
  stageNumber = 1,
  twoHanded = false,
  palmOrientation = 'Facing outward'
}) => {
  const handshapeType = detectHandshapeType(handshapeDescription, signGloss, signName);
  const normalizedAnchor = (bodyAnchor || 'neutral_space').toLowerCase();

  // Anchor coordinates on upper body silhouette (viewBox: 0 0 100 120)
  const anchorCoords: Record<string, { x: number; y: number; label: string }> = {
    forehead: { x: 50, y: 20, label: 'Forehead / Brow' },
    temple: { x: 62, y: 22, label: 'Temple' },
    ear: { x: 34, y: 27, label: 'Ear / Cheek' },
    chin: { x: 50, y: 38, label: 'Chin Level' },
    mouth: { x: 50, y: 33, label: 'Mouth / Lip' },
    throat: { x: 50, y: 46, label: 'Throat / Neck' },
    chest: { x: 50, y: 68, label: 'Mid-Chest Level' },
    shoulder: { x: 70, y: 56, label: 'Shoulder' },
    wrist: { x: 30, y: 90, label: 'Opposite Wrist' },
    hand: { x: 50, y: 80, label: 'Hand Contact' },
    neutral_space: { x: 50, y: 76, label: 'Neutral Signing Space' }
  };

  const activeAnchor = anchorCoords[normalizedAnchor] || anchorCoords['neutral_space'];

  // Render SVG Handshape illustration (Warm, natural, high-contrast anatomical design)
  const renderHandshapeSVG = () => {
    switch (handshapeType) {
      case 'index_1':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            {/* Wrist */}
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            {/* Palm Base (Fist) */}
            <rect x="34" y="62" width="52" height="56" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Curled Middle, Ring, Pinky Fingers with realistic depth */}
            <rect x="52" y="68" width="13" height="26" rx="6.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="66" y="70" width="13" height="24" rx="6.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="78" y="74" width="11" height="20" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb curled tightly across fingers */}
            <path d="M34 82 C30 74, 44 64, 58 68 C60 74, 52 86, 42 86 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Extended Index Finger (Glowing Active) */}
            <rect x="36" y="14" width="18" height="56" rx="9" fill="#fde68a" stroke="#78350f" strokeWidth="3" />
            {/* Fingernail & Knuckle creases */}
            <rect x="40" y="17" width="10" height="11" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            <line x1="39" y1="36" x2="51" y2="36" stroke="#b45309" strokeWidth="1.5" />
            <line x1="39" y1="50" x2="51" y2="50" stroke="#b45309" strokeWidth="1.5" />
            {/* Active pointing beacon */}
            <circle cx="45" cy="8" r="4" fill="#38bdf8" className="animate-ping" />
            <circle cx="45" cy="8" r="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      case 'v_peace':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            {/* Wrist */}
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            {/* Palm Base */}
            <rect x="34" y="65" width="52" height="54" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Curled Ring & Pinky */}
            <rect x="66" y="72" width="13" height="24" rx="6.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="78" y="76" width="11" height="20" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb holding fingers */}
            <path d="M34 82 C30 74, 44 64, 60 70 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Extended Index (spread left) */}
            <g transform="rotate(-15 42 70)">
              <rect x="33" y="14" width="17" height="57" rx="8.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="37" y="17" width="9" height="11" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
            {/* Extended Middle (spread right) */}
            <g transform="rotate(15 62 70)">
              <rect x="54" y="12" width="17" height="59" rx="8.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="58" y="15" width="9" height="11" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'two_parallel':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            {/* Wrist */}
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="34" y="65" width="52" height="54" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Ring and pinky curled */}
            <rect x="66" y="72" width="13" height="24" rx="6.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="78" y="76" width="11" height="20" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb */}
            <path d="M34 82 C30 74, 44 64, 60 70 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Index & Middle held parallel together */}
            <rect x="40" y="14" width="16" height="57" rx="8" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            <rect x="57" y="12" width="16" height="59" rx="8" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            {/* Pulse tap rings */}
            <circle cx="57" cy="10" r="8" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        );

      case 'w_water':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            {/* Wrist */}
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="34" y="66" width="52" height="52" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Pinky folded */}
            <rect x="76" y="76" width="11" height="20" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb pinning pinky */}
            <path d="M30 82 C30 74, 52 68, 76 76 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Index, Middle, Ring in W-formation */}
            <g transform="rotate(-18 40 70)">
              <rect x="31" y="14" width="15" height="57" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            </g>
            <rect x="47" y="10" width="15" height="61" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            <g transform="rotate(18 68 70)">
              <rect x="63" y="14" width="15" height="57" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            </g>
          </svg>
        );

      case 'thumbs_up':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            {/* Compact Clenched Fist */}
            <rect x="34" y="58" width="52" height="58" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* 4 horizontal finger rolls */}
            <rect x="38" y="64" width="44" height="11" rx="5.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="38" y="77" width="44" height="11" rx="5.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="38" y="90" width="44" height="11" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="38" y="103" width="42" height="10" rx="5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Prominent Upright Thumb */}
            <rect x="20" y="14" width="22" height="56" rx="11" fill="#fde68a" stroke="#78350f" strokeWidth="3" />
            <rect x="25" y="18" width="12" height="13" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            {/* Approval sparkle */}
            <circle cx="31" cy="7" r="4" fill="#38bdf8" />
          </svg>
        );

      case 'pinch_o':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="36" y="68" width="50" height="50" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Folded middle, ring, pinky */}
            <rect x="58" y="74" width="15" height="22" rx="7" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="72" y="78" width="13" height="20" rx="6.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Curved Index touching Thumb in O-ring */}
            <path d="M38 74 C28 48, 48 22, 66 32 C74 38, 70 54, 58 58 Z" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            <path d="M24 78 C22 58, 38 44, 56 46 C58 54, 46 70, 38 78 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Pinch contact circle */}
            <circle cx="58" cy="44" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      case 'ily':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="36" y="62" width="50" height="56" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Curled Middle & Ring */}
            <rect x="50" y="68" width="14" height="26" rx="7" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="64" y="70" width="14" height="24" rx="7" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Extended Thumb pointing left */}
            <g transform="rotate(-40 38 75)">
              <rect x="16" y="42" width="20" height="44" rx="10" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            </g>
            {/* Extended Index */}
            <rect x="36" y="14" width="16" height="56" rx="8" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            {/* Extended Pinky */}
            <rect x="76" y="26" width="14" height="48" rx="7" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            {/* Heart symbol in palm */}
            <path d="M60 85 C56 80, 52 84, 60 92 C68 84, 64 80, 60 85 Z" fill="#f43f5e" />
          </svg>
        );

      case 'pinky_up':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="34" y="60" width="52" height="58" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Thumb curled over index, middle, ring */}
            <rect x="38" y="66" width="38" height="12" rx="6" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="38" y="80" width="38" height="12" rx="6" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="38" y="94" width="38" height="12" rx="6" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <path d="M28 82 C26 72, 44 64, 58 70 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
            {/* Upright Pinky Finger */}
            <rect x="74" y="16" width="15" height="54" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="3" />
            <rect x="77" y="20" width="9" height="11" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
          </svg>
        );

      case 'phone_y':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="36" y="62" width="50" height="54" rx="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Curled 3 middle fingers */}
            <rect x="40" y="68" width="40" height="11" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="40" y="81" width="40" height="11" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="40" y="94" width="40" height="11" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb extended upward-left (Earpiece) */}
            <g transform="rotate(-35 34 50)">
              <rect x="22" y="14" width="17" height="48" rx="8.5" fill="#fde68a" stroke="#78350f" strokeWidth="3" />
            </g>
            {/* Pinky extended downward-right (Mouthpiece) */}
            <g transform="rotate(35 84 90)">
              <rect x="76" y="78" width="16" height="44" rx="8" fill="#fde68a" stroke="#78350f" strokeWidth="3" />
            </g>
          </svg>
        );

      case 'roof_hands':
        return (
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-lg">
            {/* Left Diagonal Flat Hand */}
            <g transform="rotate(38 70 45)">
              <rect x="38" y="28" width="24" height="64" rx="11" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            </g>
            {/* Right Diagonal Flat Hand */}
            <g transform="rotate(-38 70 45)">
              <rect x="76" y="28" width="24" height="64" rx="11" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
            </g>
            {/* Roof Peak Apex glow */}
            <circle cx="70" cy="26" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      case 'clenched_fist':
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            <rect x="32" y="52" width="56" height="66" rx="18" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
            {/* 4 tight finger curls */}
            <rect x="36" y="58" width="48" height="13" rx="6.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="36" y="73" width="48" height="13" rx="6.5" fill="#d97706" stroke="#78350f" strokeWidth="2" />
            <rect x="36" y="88" width="48" height="13" rx="6.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            <rect x="36" y="103" width="46" height="11" rx="5.5" fill="#b45309" stroke="#78350f" strokeWidth="2" />
            {/* Thumb wrapped tight across front */}
            <path d="M24 76 C22 62, 46 54, 76 64 C76 72, 52 86, 34 84 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" />
          </svg>
        );

      case 'flat_palm':
      case 'open_5':
      default:
        return (
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg">
            {/* Wrist */}
            <path d="M46 114 L46 136 L74 136 L74 114 Z" fill="#d97706" opacity="0.6" stroke="#f59e0b" strokeWidth="2" />
            {/* Wide Open Palm */}
            <path d="M36 66 C32 94, 40 116, 60 116 C80 116, 88 94, 84 66 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
            {/* Thumb extended outward */}
            <g transform="rotate(-38 34 76)">
              <rect x="16" y="48" width="18" height="44" rx="9" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="20" y="52" width="9" height="10" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
            {/* 4 Extended Fingers spread upright */}
            {/* Index */}
            <g transform="rotate(-10 44 70)">
              <rect x="35" y="16" width="15" height="56" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="38" y="19" width="9" height="10" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
            {/* Middle */}
            <g transform="rotate(-2 54 70)">
              <rect x="49" y="10" width="15" height="62" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="52" y="13" width="9" height="10" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
            {/* Ring */}
            <g transform="rotate(6 66 70)">
              <rect x="63" y="14" width="15" height="57" rx="7.5" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="66" y="17" width="9" height="10" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
            {/* Pinky */}
            <g transform="rotate(16 78 70)">
              <rect x="75" y="26" width="14" height="47" rx="7" fill="#fde68a" stroke="#78350f" strokeWidth="2.5" />
              <rect x="78" y="29" width="8" height="9" rx="3.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            </g>
          </svg>
        );
    }
  };

  // Trajectory direction arrows
  const renderTrajectoryArrow = () => {
    const traj = (movementTrajectory || '').toLowerCase();
    
    if (traj.includes('outward') || traj.includes('forward') || traj.includes('toward partner')) {
      return (
        <svg viewBox="0 0 100 40" className="w-24 h-10 text-teal-300">
          <defs>
            <marker id="arrow-forward" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
            </marker>
          </defs>
          <path d="M 10 20 L 80 20" stroke="#2dd4bf" strokeWidth="3" strokeDasharray="4 4" markerEnd="url(#arrow-forward)" />
        </svg>
      );
    }

    if (traj.includes('downward') || traj.includes('pulling') || traj.includes('rain')) {
      return (
        <svg viewBox="0 0 40 80" className="w-10 h-20 text-teal-300">
          <defs>
            <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
            </marker>
          </defs>
          <path d="M 20 10 L 20 68" stroke="#2dd4bf" strokeWidth="3" strokeDasharray="4 4" markerEnd="url(#arrow-down)" />
        </svg>
      );
    }

    if (traj.includes('tap') || traj.includes('pulse') || traj.includes('wrist')) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span>Double Tap Contact</span>
        </div>
      );
    }

    if (traj.includes('circular') || traj.includes('rub')) {
      return (
        <svg viewBox="0 0 60 60" className="w-16 h-16 text-teal-300">
          <defs>
            <marker id="arrow-circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2dd4bf" />
            </marker>
          </defs>
          <path d="M 45 30 A 18 18 0 1 1 30 12" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeDasharray="4 3" markerEnd="url(#arrow-circle)" />
        </svg>
      );
    }

    return (
      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-medium">
        <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
        <span>Directional Stroke</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-navy-950/90 rounded-2xl border border-navy-800/80 p-4 text-white shadow-xl">
      {/* 1. Left: Anatomical Handshape Vector Illustration (Col 7) */}
      <div className="md:col-span-7 bg-navy-900/80 rounded-xl border border-navy-800 p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex items-center justify-between text-xs pb-2 border-b border-navy-800">
          <span className="font-bold text-teal-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Handshape Posture</span>
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
            {twoHanded ? 'Two-Handed Formation' : 'Single Hand (Dominant)'}
          </span>
        </div>

        {/* Center Hand SVG Graphic */}
        <div className="my-auto py-2 flex items-center justify-center relative">
          <div className="w-32 h-36 relative">
            {renderHandshapeSVG()}
          </div>
          {/* Motion arrow overlay */}
          <div className="absolute bottom-1 right-2 bg-navy-950/80 px-2 py-1 rounded-lg border border-navy-700/60 shadow-xs">
            {renderTrajectoryArrow()}
          </div>
        </div>

        {/* Bottom Handshape Description */}
        <div className="pt-2 border-t border-navy-800/80 space-y-1">
          <p className="text-xs font-bold text-teal-200">
            {handshapeDescription}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-navy-400 font-mono">
            <span>Palm Orientation: <strong className="text-teal-300">{palmOrientation}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Right: Anatomical Body Anchor Locator Diagram (Col 5) */}
      <div className="md:col-span-5 bg-navy-900/80 rounded-xl border border-navy-800 p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-navy-800">
          <span className="font-bold text-indigo-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Body Anchor Location</span>
          </span>
          <span className="text-[10px] text-navy-400 uppercase font-mono">
            Spatial Grid
          </span>
        </div>

        {/* Anatomical Upper Body Silhouette SVG with Beacon */}
        <div className="my-auto py-2 flex items-center justify-center">
          <div className="relative w-28 h-36 bg-navy-950/90 rounded-xl border border-navy-800 p-1 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              {/* Head Silhouette */}
              <circle cx="50" cy="26" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {/* Neck */}
              <rect x="46" y="40" width="8" height="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              {/* Shoulders & Torso */}
              <path 
                d="M18 78 C20 54, 34 50, 50 50 C66 50, 80 54, 82 78 L82 115 L18 115 Z" 
                fill="#1e293b" 
                stroke="#334155" 
                strokeWidth="2" 
              />
              {/* Arms Outlines */}
              <path d="M22 68 L10 100 M78 68 L90 100" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
              {/* Neutral signing box guide */}
              <rect x="25" y="60" width="50" height="40" rx="4" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

              {/* Glowing Active Anchor Beacon */}
              <circle cx={activeAnchor.x} cy={activeAnchor.y} r="8" fill="#14b8a6" opacity="0.3" className="animate-ping" />
              <circle cx={activeAnchor.x} cy={activeAnchor.y} r="4" fill="#2dd4bf" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Anchor Label Card */}
        <div className="bg-black/40 p-2 rounded-lg border border-navy-800 space-y-0.5 text-center">
          <span className="text-[10px] text-navy-400 uppercase font-mono">Anchor Contact</span>
          <p className="text-xs font-bold text-indigo-300">
            {activeAnchor.label}
          </p>
        </div>
      </div>
    </div>
  );
};
