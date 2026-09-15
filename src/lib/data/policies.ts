export type Policy = {
  id: string;
  title: string;
  summary: string;
  detail: string[];
  /** Shown as a compact required-acknowledgement item during checkout. */
  critical?: boolean;
};

export const BOOKING_POLICIES: Policy[] = [
  {
    id: 'deposit',
    title: 'Deposit',
    summary: 'A 50% non-refundable deposit secures your appointment.',
    detail: [
      'Your booking is confirmed once the 50% deposit is received. The balance is settled in-studio on the day.',
      'Deposits are non-refundable. They may be transferred once to a rescheduled appointment when you give at least 24 hours notice.',
    ],
    critical: true,
  },
  {
    id: 'arrival',
    title: 'Arrival',
    summary: 'Please arrive 5–10 minutes before your appointment time.',
    detail: [
      'Arriving a few minutes early lets us settle you in properly and start on time.',
      'Arriving more than 15 minutes late may mean a shortened service, a reschedule, or a cancellation — whichever protects the quality of your result and the guest booked after you.',
    ],
    critical: true,
  },
  {
    id: 'cancellation',
    title: 'Cancellation & rescheduling',
    summary: '24 hours notice is required to move or cancel.',
    detail: [
      'Give us at least 24 hours and we will happily move your appointment and carry your deposit across.',
      'Inside 24 hours, the deposit is forfeited, as the time can rarely be refilled.',
    ],
    critical: true,
  },
  {
    id: 'no-show',
    title: 'No-show',
    summary: 'Deposits are forfeited for missed appointments.',
    detail: [
      'If we do not hear from you and the appointment is missed, the deposit is forfeited.',
      'Repeated no-shows may require full prepayment on future bookings.',
    ],
    critical: true,
  },
  {
    id: 'preparation',
    title: 'How to prepare',
    summary: 'Arrive with clean brows, lashes, face and hair unless advised otherwise.',
    detail: [
      'Come with no makeup on the treatment area, clean lashes free of mascara and oils, and freshly washed hair for hair services.',
      'For permanent makeup, avoid caffeine, alcohol and blood-thinning supplements for 24 hours beforehand.',
      'For waxing, hair should be about a quarter of an inch long, and please avoid exfoliating for 24 hours prior.',
    ],
  },
  {
    id: 'guests',
    title: 'Guests & children',
    summary: 'Additional guests and children only by prior arrangement.',
    detail: [
      'The studio is designed to be calm. Please do not bring additional guests or children unless it has been approved in advance.',
      'Group and celebration bookings are very welcome — book The Celebration package and the whole space is arranged for you.',
    ],
  },
  {
    id: 'disclosure',
    title: 'Client disclosure',
    summary: 'Tell us about allergies, pregnancy, sensitivities and recent procedures.',
    detail: [
      'Please disclose any allergies, pregnancy or breastfeeding, skin sensitivities, medical conditions, current medication, and any cosmetic procedure in the last six weeks.',
      'This is not bureaucracy — several of our actives, pigments and treatments are contraindicated, and disclosure lets us adapt the protocol so you still get a result safely.',
    ],
    critical: true,
  },
];

export const FAQS = [
  {
    q: 'How do I secure my appointment?',
    a: 'Choose your service, specialist and time through our booking flow, then pay the 50% deposit. You will receive confirmation by email and WhatsApp within minutes.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Deposits are taken online via Mobile Money and card. The balance can be settled in-studio by Mobile Money, card or cash.',
  },
  {
    q: 'Can I book more than one service in a visit?',
    a: 'Yes — and we would encourage it. Our packages are sequenced in the correct order and priced below the sum of their parts. For a custom combination, message us on WhatsApp and we will build the timeline.',
  },
  {
    q: 'Do you work on all skin tones and hair textures?',
    a: 'Every artist here is trained specifically on deep complexions and textured hair. Pigment selection, undertone matching and tension-free technique are the foundation of how we work, not an afterthought.',
  },
  {
    q: 'What if I am not sure which treatment I need?',
    a: 'Book a consultation. Thirty minutes with a therapist, a magnified skin analysis or a brow mapping, and a written plan — redeemable against your first treatment.',
  },
  {
    q: 'Where exactly are you located?',
    a: 'We are in Hebron, Accra. Once your booking is confirmed we send the exact pin and parking guidance by WhatsApp.',
  },
  {
    q: 'Do you offer training?',
    a: 'Yes. Marilux Institute runs certified, small-cohort courses in brows, lashes, nails, makeup, wigs and skincare, plus a twelve-week full beauty therapy diploma with a studio placement.',
  },
] as const;
