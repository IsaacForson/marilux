/**
 * Marilux Beauty Bar — service catalogue.
 *
 * Prices are indicative placeholders in Ghana Cedis and are intended to be
 * replaced with live pricing. Keep `priceFrom` true wherever the final figure
 * depends on length, density or condition so the UI can render "from GHS ...".
 */

export type Service = {
  slug: string;
  name: string;
  description: string;
  /** Minutes. Used for booking slot maths and for display. */
  duration: number;
  /** Indicative price in GHS. */
  price: number;
  priceFrom?: boolean;
  /** Surfaces the service on the home page and in category headers. */
  featured?: boolean;
  /** Short qualifiers shown as pills. */
  tags?: string[];
};

export type CategoryMood = {
  /** Primary accent used for type, rules and glows on the category page. */
  accent: string;
  /** Two-stop ambient gradient for the page aura. */
  from: string;
  to: string;
  /** Tailwind-friendly rgb triplet for alpha composition. */
  rgb: string;
};

export type ServiceCategory = {
  slug: string;
  name: string;
  /** Two or three words. Sits under the category title. */
  tagline: string;
  /** One sentence for cards and meta descriptions. */
  summary: string;
  /** Editorial paragraph for the category page hero. */
  intro: string;
  /** The promise of the room — shown as a three-part ritual. */
  ritual: [string, string, string];
  mood: CategoryMood;
  services: Service[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: 'brows-permanent-makeup',
    name: 'Brows & Permanent Makeup',
    tagline: 'Architecture for the face',
    summary:
      'Hand-mapped brow artistry and pigment work designed around your bone structure, not a trend.',
    intro:
      'Everything begins with the brow. Our artists map each face by measurement before a single stroke is made, so the shape that leaves our studio belongs to you alone — balanced, deliberate, and quietly transformative.',
    ritual: [
      'Facial mapping and pigment consultation',
      'Precision artistry with single-use tooling',
      'Healed review and complimentary refinement',
    ],
    mood: { accent: '#D9BC8C', from: '#3A2A18', to: '#0B0A09', rgb: '217 188 140' },
    services: [
      {
        slug: 'microblading',
        name: 'Microblading',
        description:
          'Hair-stroke pigment work that rebuilds sparse brows one filament at a time. Best suited to normal and dry skin.',
        duration: 150,
        price: 1200,
        featured: true,
        tags: ['Semi-permanent', 'Includes 6-week perfecting session'],
      },
      {
        slug: 'ombre-powder-brows',
        name: 'Ombré Powder Brows',
        description:
          'A soft, misted gradient that reads like a perfectly shaded brow — light at the front, defined at the tail. Suits every skin type, including oily.',
        duration: 165,
        price: 1400,
        featured: true,
        tags: ['Semi-permanent', 'Oily-skin friendly'],
      },
      {
        slug: 'combination-brows',
        name: 'Combination Brows',
        description:
          'Hair strokes through the body of the brow with a powdered tail. The most dimensional result we offer.',
        duration: 180,
        price: 1600,
        tags: ['Signature'],
      },
      {
        slug: 'brow-lamination',
        name: 'Brow Lamination',
        description:
          'A gentle restructuring treatment that lifts and sets the hair upward for a fuller, brushed-up brow that lasts six to eight weeks.',
        duration: 60,
        price: 350,
        featured: true,
        tags: ['No needles', 'Includes shaping'],
      },
      {
        slug: 'brow-tint-shape',
        name: 'Brow Tint & Shape',
        description:
          'Colour-matched tint with threading or waxing to define the shape you already have.',
        duration: 45,
        price: 180,
      },
      {
        slug: 'brow-shaping',
        name: 'Brow Shaping & Threading',
        description: 'Clean, symmetrical shaping by thread — precise and kind to sensitive skin.',
        duration: 30,
        price: 100,
      },
      {
        slug: 'lip-blush',
        name: 'Lip Blush & Neutralisation',
        description:
          'Pigment that evens tone, softens hyperpigmentation and restores definition to the lip border with a naturally flushed finish.',
        duration: 180,
        price: 1800,
        tags: ['Semi-permanent', 'Patch test required'],
      },
      {
        slug: 'eyeliner-tattoo',
        name: 'Permanent Eyeliner',
        description:
          'A fine lash-line enhancement or a soft smoked liner — set once, perfect every morning.',
        duration: 150,
        price: 1300,
        tags: ['Semi-permanent'],
      },
      {
        slug: 'pmu-touch-up',
        name: 'Permanent Makeup Touch-Up',
        description:
          'Annual colour refresh for existing Marilux pigment work. Booked between nine and eighteen months.',
        duration: 120,
        price: 700,
        priceFrom: true,
      },
      {
        slug: 'brow-correction',
        name: 'Correction & Colour Removal',
        description:
          'Saline lightening and reshaping for pigment work done elsewhere. Assessed in consultation before booking.',
        duration: 120,
        price: 900,
        priceFrom: true,
        tags: ['Consultation first'],
      },
    ],
  },
  {
    slug: 'lashes',
    name: 'Lashes',
    tagline: 'Weightless dimension',
    summary:
      'Lash artistry mapped to your eye shape, applied one isolated extension at a time.',
    intro:
      'A lash set should feel like nothing and read like everything. We map curl, length and density to the shape of your eye, then place each extension on its own natural lash so your own lashes stay healthy underneath.',
    ritual: [
      'Eye mapping and curl selection',
      'Isolated application, lash by lash',
      'Aftercare kit and refill rhythm',
    ],
    mood: { accent: '#DCAFA4', from: '#33201E', to: '#0B0A09', rgb: '220 175 164' },
    services: [
      {
        slug: 'classic-set',
        name: 'Classic Set',
        description:
          'One extension to one natural lash. Length without weight — the quiet everyday set.',
        duration: 105,
        price: 350,
        featured: true,
      },
      {
        slug: 'hybrid-set',
        name: 'Hybrid Set',
        description:
          'Classic lashes woven with handmade fans for texture and a softly undone finish.',
        duration: 120,
        price: 450,
        featured: true,
      },
      {
        slug: 'volume-set',
        name: 'Volume Set',
        description:
          'Handmade fans of three to six ultra-fine lashes for a dark, full lash line that still feels light.',
        duration: 135,
        price: 550,
        featured: true,
      },
      {
        slug: 'mega-volume',
        name: 'Mega Volume',
        description:
          'Our densest set — fans of up to sixteen lashes, built for photography and celebration.',
        duration: 165,
        price: 700,
        tags: ['Statement'],
      },
      {
        slug: 'wispy-set',
        name: 'Wispy Angel Set',
        description:
          'Spiked, textured mapping with alternating lengths for a fluttery, editorial silhouette.',
        duration: 140,
        price: 600,
      },
      {
        slug: 'lash-lift-tint',
        name: 'Lash Lift & Tint',
        description:
          'Your own lashes, curled from the root and tinted black. Six to eight weeks, no extensions.',
        duration: 75,
        price: 300,
      },
      {
        slug: 'lash-refill-2w',
        name: 'Refill — 2 Weeks',
        description: 'Maintenance for existing Marilux sets booked within fourteen days.',
        duration: 75,
        price: 200,
        priceFrom: true,
      },
      {
        slug: 'lash-refill-3w',
        name: 'Refill — 3 Weeks',
        description: 'Maintenance for existing Marilux sets booked within twenty-one days.',
        duration: 90,
        price: 260,
        priceFrom: true,
      },
      {
        slug: 'lash-removal',
        name: 'Professional Removal',
        description:
          'Gentle gel dissolution that protects the natural lash. Complimentary when followed by a new set.',
        duration: 30,
        price: 80,
      },
    ],
  },
  {
    slug: 'hair-wigs-installation',
    name: 'Hair, Wigs & Installation',
    tagline: 'An invisible finish',
    summary:
      'Customisation, installation and colour work engineered so the hairline reads as your own.',
    intro:
      'A wig should never announce itself. Our stylists bleach, pluck and tint every knot by hand, then install with a seamless melt and a cut shaped to your face. The result moves the way hair should.',
    ritual: [
      'Customisation: knots, hairline, density',
      'Melt, lay and heat-set installation',
      'Precision cut, style and maintenance plan',
    ],
    mood: { accent: '#C9AE93', from: '#2C2318', to: '#0B0A09', rgb: '201 174 147' },
    services: [
      {
        slug: 'frontal-installation',
        name: 'Frontal Wig Installation',
        description:
          'Full lace or 13x4 frontal laid with a true melt, baby hairs sculpted and set to last.',
        duration: 120,
        price: 400,
        featured: true,
      },
      {
        slug: 'closure-installation',
        name: 'Closure Wig Installation',
        description: 'Clean 5x5 or 4x4 closure install with styling and edge work.',
        duration: 90,
        price: 300,
      },
      {
        slug: 'wig-customisation',
        name: 'Full Wig Customisation',
        description:
          'Knot bleaching, plucking, lace tinting and pre-cut baby hairs — the work that makes a unit look grown.',
        duration: 180,
        price: 500,
        featured: true,
        tags: ['Hair not included'],
      },
      {
        slug: 'wig-revamp',
        name: 'Wig Revamp & Restoration',
        description:
          'Deep wash, detangle, protein treatment and restyle to bring a tired unit back to life.',
        duration: 150,
        price: 350,
        priceFrom: true,
      },
      {
        slug: 'wig-construction',
        name: 'Wig Construction',
        description:
          'Made-to-measure unit built on your cap size — machine sewn, ventilated hairline optional.',
        duration: 240,
        price: 800,
        priceFrom: true,
        tags: ['Hair not included'],
      },
      {
        slug: 'braided-wig',
        name: 'Braided Wig',
        description: 'Knotless braided unit, made to order in your chosen length and colour.',
        duration: 300,
        price: 900,
        priceFrom: true,
      },
      {
        slug: 'weave-install',
        name: 'Sew-In & Weave Installation',
        description: 'Braid-down, sew-in and blend with a leave-out or closure of your choice.',
        duration: 180,
        price: 350,
        priceFrom: true,
      },
      {
        slug: 'cornrows',
        name: 'Cornrows & Feed-In Styles',
        description: 'Clean, tension-free parting in straight-back or designed patterns.',
        duration: 120,
        price: 200,
        priceFrom: true,
      },
      {
        slug: 'silk-press',
        name: 'Silk Press',
        description:
          'Wash, deep condition and a mirror-flat press with movement — heat-protected throughout.',
        duration: 120,
        price: 300,
        featured: true,
      },
      {
        slug: 'hair-colour',
        name: 'Colour & Toning',
        description:
          'Bespoke colour, root work or toning by a colourist. Priced after a strand assessment.',
        duration: 180,
        price: 600,
        priceFrom: true,
        tags: ['Consultation first'],
      },
      {
        slug: 'hair-treatment',
        name: 'Scalp & Bond Treatment',
        description:
          'Clarify, treat and seal — a steam-assisted ritual for stressed scalps and over-processed strands.',
        duration: 75,
        price: 250,
      },
      {
        slug: 'bridal-hair',
        name: 'Bridal Hair Styling',
        description:
          'Trial and wedding-day styling, timed around your ceremony and photographed to check every angle.',
        duration: 150,
        price: 900,
        priceFrom: true,
      },
    ],
  },
  {
    slug: 'nails-manicure-pedicure',
    name: 'Nails, Manicure & Pedicure',
    tagline: 'Considered hands',
    summary:
      'Structured nail work, immaculate cuticles and pedicures that treat the foot, not just the polish.',
    intro:
      'Detail is the whole discipline. Cuticles are worked dry and clean, apex and sidewall are built with intention, and every tool is sterilised in a medical-grade autoclave between guests.',
    ritual: [
      'Dry preparation and structural shaping',
      'Build, colour and hand-finished art',
      'Cuticle oil ritual and longevity guidance',
    ],
    mood: { accent: '#F1DCD9', from: '#332428', to: '#0B0A09', rgb: '241 220 217' },
    services: [
      {
        slug: 'classic-manicure',
        name: 'Classic Manicure',
        description: 'Shape, cuticle work, hand massage and a polish of your choice.',
        duration: 45,
        price: 120,
      },
      {
        slug: 'gel-manicure',
        name: 'Gel Manicure',
        description: 'Full preparation with a high-shine gel finish that holds for three weeks.',
        duration: 60,
        price: 180,
        featured: true,
      },
      {
        slug: 'acrylic-full-set',
        name: 'Acrylic Full Set',
        description:
          'Sculpted extensions in your chosen length and shape, built for strength and balance.',
        duration: 105,
        price: 350,
        featured: true,
      },
      {
        slug: 'gel-x-set',
        name: 'Gel-X Extensions',
        description:
          'Soft gel tips applied full-coverage — lightweight, flexible and gentle on the natural nail.',
        duration: 90,
        price: 320,
        featured: true,
      },
      {
        slug: 'builder-gel',
        name: 'Builder Gel Overlay',
        description: 'Reinforcement over the natural nail for those growing their own length.',
        duration: 75,
        price: 250,
      },
      {
        slug: 'nail-art',
        name: 'Bespoke Nail Art',
        description:
          'Freehand art, chrome, encapsulation and hardware. Priced per nail by complexity.',
        duration: 45,
        price: 20,
        priceFrom: true,
        tags: ['Per nail'],
      },
      {
        slug: 'french-finish',
        name: 'French & Micro-French',
        description: 'The classic, drawn by hand — crisp, thin and perfectly even.',
        duration: 30,
        price: 80,
      },
      {
        slug: 'acrylic-refill',
        name: 'Refill & Rebalance',
        description: 'Two to three week maintenance on an existing Marilux set.',
        duration: 90,
        price: 250,
      },
      {
        slug: 'soak-off',
        name: 'Safe Removal',
        description:
          'E-file and soak removal with a nourishing treatment. Complimentary with a new set.',
        duration: 30,
        price: 70,
      },
      {
        slug: 'classic-pedicure',
        name: 'Classic Pedicure',
        description: 'Soak, shape, cuticle care, light exfoliation and polish.',
        duration: 60,
        price: 180,
      },
      {
        slug: 'spa-pedicure',
        name: 'Luxury Spa Pedicure',
        description:
          'Warm soak, salt scrub, clay mask, hot towel and an extended leg and foot massage.',
        duration: 90,
        price: 300,
        featured: true,
      },
      {
        slug: 'callus-treatment',
        name: 'Callus & Heel Restoration',
        description:
          'Clinical-grade softening and reduction for cracked heels and built-up callus.',
        duration: 60,
        price: 220,
      },
      {
        slug: 'paraffin-treatment',
        name: 'Paraffin Hand or Foot Treatment',
        description: 'Warm wax immersion that floods dry skin with moisture and eases stiffness.',
        duration: 30,
        price: 150,
      },
    ],
  },
  {
    slug: 'facials-skincare',
    name: 'Facials & Skincare',
    tagline: 'Results, quietly',
    summary:
      'Analysis-led facials that treat the skin you have today and build toward the skin you want.',
    intro:
      'Every facial opens with a magnified analysis, because a protocol should answer your barrier, not a menu. We work in courses, not one-offs — and we will tell you honestly when a treatment is not right for you.',
    ritual: [
      'Magnified analysis and barrier assessment',
      'Bespoke protocol with active selection',
      'Home routine mapped to your week',
    ],
    mood: { accent: '#EBD6B3', from: '#2A2A1F', to: '#0B0A09', rgb: '235 214 179' },
    services: [
      {
        slug: 'skin-consultation',
        name: 'Skin Consultation',
        description:
          'Thirty minutes with a therapist, a magnified analysis and a written plan. Redeemable against your first facial.',
        duration: 30,
        price: 100,
      },
      {
        slug: 'signature-facial',
        name: 'The Marilux Signature Facial',
        description:
          'Double cleanse, enzyme resurfacing, extractions, lymphatic massage, mask and LED. Our most requested treatment.',
        duration: 75,
        price: 450,
        featured: true,
      },
      {
        slug: 'deep-cleansing-facial',
        name: 'Deep Cleansing Facial',
        description:
          'Steam-assisted decongestion with thorough, careful extractions and a calming finish.',
        duration: 60,
        price: 350,
      },
      {
        slug: 'hydra-glow-facial',
        name: 'Hydra Glow Facial',
        description:
          'Vortex cleansing, gentle exfoliation and serum infusion for immediate luminosity with no downtime.',
        duration: 60,
        price: 500,
        featured: true,
        tags: ['Event-ready'],
      },
      {
        slug: 'anti-acne-facial',
        name: 'Clarifying Acne Facial',
        description:
          'A course-based protocol for active congestion, combining salicylic resurfacing with barrier repair.',
        duration: 75,
        price: 450,
        tags: ['Course recommended'],
      },
      {
        slug: 'brightening-facial',
        name: 'Brightening & Even-Tone Facial',
        description:
          'Targeted work on post-inflammatory marks and uneven tone using tyrosinase-inhibiting actives.',
        duration: 75,
        price: 500,
        featured: true,
      },
      {
        slug: 'anti-aging-facial',
        name: 'Firming & Renewal Facial',
        description:
          'Peptide and retinoid-assisted treatment with sculpting massage and radiofrequency-free lifting.',
        duration: 90,
        price: 600,
      },
      {
        slug: 'chemical-peel',
        name: 'Chemical Peel',
        description:
          'Medium-depth resurfacing selected after consultation. Patch test and pre-care required.',
        duration: 45,
        price: 550,
        tags: ['Consultation first'],
      },
      {
        slug: 'dermaplaning',
        name: 'Dermaplaning',
        description:
          'Sterile blade exfoliation that removes vellus hair and dead surface cells for a glass finish.',
        duration: 45,
        price: 400,
      },
      {
        slug: 'microneedling',
        name: 'Microneedling',
        description:
          'Collagen induction for texture, scarring and laxity. Delivered as a course of three to six.',
        duration: 75,
        price: 750,
        tags: ['Consultation first', 'Course recommended'],
      },
      {
        slug: 'led-therapy',
        name: 'LED Light Therapy',
        description:
          'Twenty minutes of clinical red or blue light. Add to any facial or book as a standalone course.',
        duration: 30,
        price: 180,
      },
      {
        slug: 'back-facial',
        name: 'Back Facial',
        description: 'Cleansing, exfoliation and extraction for the back, shoulders and décolleté.',
        duration: 60,
        price: 400,
      },
      {
        slug: 'teen-facial',
        name: 'Teen Skin Facial',
        description:
          'A gentle introduction to skincare for ages thirteen to seventeen, with routine coaching.',
        duration: 45,
        price: 250,
      },
    ],
  },
  {
    slug: 'waxing-hair-removal',
    name: 'Waxing & Hair Removal',
    tagline: 'Fast, clean, dignified',
    summary:
      'Hard-wax hair removal in a private room, performed quickly and with complete discretion.',
    intro:
      'Comfort is a technical achievement. We use premium hard wax at a low working temperature, work in small sections, and keep the room private and warm. Most guests tell us it was faster and kinder than they expected.',
    ritual: [
      'Private room and skin preparation',
      'Low-temperature hard wax, section by section',
      'Soothing serum and ingrown prevention',
    ],
    mood: { accent: '#E3D3C1', from: '#26201C', to: '#0B0A09', rgb: '227 211 193' },
    services: [
      {
        slug: 'brazilian-wax',
        name: 'Brazilian',
        description: 'Complete removal with hard wax, finished with a calming post-wax serum.',
        duration: 45,
        price: 250,
        featured: true,
      },
      {
        slug: 'bikini-wax',
        name: 'Bikini Line',
        description: 'Clean removal beyond the swimwear line.',
        duration: 30,
        price: 150,
      },
      {
        slug: 'underarm-wax',
        name: 'Underarm',
        description: 'Quick, thorough and gentle on delicate skin.',
        duration: 20,
        price: 80,
        featured: true,
      },
      {
        slug: 'full-leg-wax',
        name: 'Full Leg',
        description: 'Ankle to upper thigh, including the knee.',
        duration: 60,
        price: 300,
      },
      {
        slug: 'half-leg-wax',
        name: 'Half Leg',
        description: 'Ankle to knee, or knee to thigh.',
        duration: 35,
        price: 180,
      },
      {
        slug: 'full-arm-wax',
        name: 'Full Arm',
        description: 'Shoulder to wrist, including the hand.',
        duration: 40,
        price: 200,
      },
      {
        slug: 'back-chest-wax',
        name: 'Back or Chest',
        description: 'Full coverage with post-wax decongesting treatment.',
        duration: 45,
        price: 250,
      },
      {
        slug: 'face-wax',
        name: 'Facial Waxing',
        description: 'Upper lip, chin, sides or the full face — priced per area.',
        duration: 20,
        price: 60,
        priceFrom: true,
      },
      {
        slug: 'full-body-wax',
        name: 'Full Body',
        description: 'Everything, in one appointment. Our most efficient option.',
        duration: 150,
        price: 900,
        tags: ['Best value'],
      },
      {
        slug: 'threading',
        name: 'Threading',
        description: 'Brow, lip or chin threading for precision on sensitive skin.',
        duration: 20,
        price: 60,
        priceFrom: true,
      },
    ],
  },
  {
    slug: 'body-spa-wellness',
    name: 'Body, Spa & Wellness',
    tagline: 'The long exhale',
    summary:
      'Massage, scrubs and body rituals in a low-lit suite built for genuine decompression.',
    intro:
      'The spa suite runs on a different clock. Warm stone, low light, a scent profile developed for the room, and therapists who will not talk unless you want them to. Come early; the tea is part of the treatment.',
    ritual: [
      'Warm welcome, foot cleanse and tea',
      'Bespoke pressure and aromatic selection',
      'Rest, rehydrate, return slowly',
    ],
    mood: { accent: '#B99863', from: '#20221F', to: '#0B0A09', rgb: '185 152 99' },
    services: [
      {
        slug: 'full-body-massage',
        name: 'Full Body Massage',
        description: 'Sixty or ninety minutes of flowing, full-body work at your chosen pressure.',
        duration: 60,
        price: 400,
        featured: true,
      },
      {
        slug: 'swedish-massage',
        name: 'Swedish Massage',
        description: 'Long, warming strokes for circulation and nervous-system calm.',
        duration: 60,
        price: 400,
      },
      {
        slug: 'deep-tissue-massage',
        name: 'Deep Tissue Massage',
        description:
          'Focused pressure through adhesions and chronic tension in the back, neck and shoulders.',
        duration: 75,
        price: 500,
        featured: true,
      },
      {
        slug: 'hot-stone-massage',
        name: 'Hot Stone Massage',
        description: 'Heated basalt placed and glided along the meridians of the back and limbs.',
        duration: 90,
        price: 650,
      },
      {
        slug: 'aromatherapy-massage',
        name: 'Aromatherapy Ritual',
        description:
          'A blend selected with you at the start of the session, worked through body and scalp.',
        duration: 75,
        price: 550,
      },
      {
        slug: 'body-scrub',
        name: 'Body Scrub & Polish',
        description:
          'Full-body exfoliation with a shea and sugar polish, finished in warm body butter.',
        duration: 60,
        price: 450,
        featured: true,
      },
      {
        slug: 'body-wrap',
        name: 'Detox Body Wrap',
        description: 'Clay or seaweed wrap with steam for tone, texture and water retention.',
        duration: 75,
        price: 550,
      },
      {
        slug: 'steam-session',
        name: 'Steam & Soak',
        description: 'Twenty minutes of herbal steam. Beautiful before any body treatment.',
        duration: 30,
        price: 150,
      },
      {
        slug: 'vajacial',
        name: 'Vajacial',
        description:
          'Cleansing, gentle exfoliation, extraction and a soothing mask for the bikini area. Ideal a week after waxing.',
        duration: 45,
        price: 350,
      },
      {
        slug: 'body-evening-treatment',
        name: 'Tone-Evening Body Treatment',
        description:
          'A targeted course for hyperpigmentation on knees, elbows, underarms and the bikini line.',
        duration: 60,
        price: 450,
        tags: ['Course recommended'],
      },
      {
        slug: 'stretch-mark-treatment',
        name: 'Stretch Mark & Texture Therapy',
        description:
          'Microneedling-assisted body work to soften the appearance of striae over a course.',
        duration: 75,
        price: 700,
        tags: ['Consultation first'],
      },
      {
        slug: 'couples-spa',
        name: 'Couples Spa Ritual',
        description: 'Two therapists, one suite, ninety minutes. Massage, scrub and refreshments.',
        duration: 90,
        price: 1200,
        tags: ['For two'],
      },
    ],
  },
  {
    slug: 'aesthetic-enhancement',
    name: 'Aesthetic & Beauty Enhancement',
    tagline: 'The finishing details',
    summary:
      'Makeup artistry, teeth whitening, piercing and the small refinements that complete a look.',
    intro:
      'These are the details people notice without being able to name them. A cleaner smile line, a piercing placed at exactly the right angle, skin that catches light in the right places on camera.',
    ritual: [
      'Look direction and tone matching',
      'Application with photographic testing',
      'Touch-up kit and longevity advice',
    ],
    mood: { accent: '#C08A7E', from: '#2E1F22', to: '#0B0A09', rgb: '192 138 126' },
    services: [
      {
        slug: 'soft-glam-makeup',
        name: 'Soft Glam Makeup',
        description:
          'Skin-first application with a diffused eye and a natural lip. Photographs beautifully in daylight.',
        duration: 75,
        price: 350,
        featured: true,
      },
      {
        slug: 'full-glam-makeup',
        name: 'Full Glam Makeup',
        description: 'High-definition artistry with lashes included, built to last a full evening.',
        duration: 90,
        price: 500,
        featured: true,
      },
      {
        slug: 'bridal-makeup',
        name: 'Bridal Makeup',
        description:
          'Trial session, wedding-day application and a touch-up kit. Travel available on request.',
        duration: 120,
        price: 1500,
        priceFrom: true,
        tags: ['Includes trial'],
      },
      {
        slug: 'bridal-party-makeup',
        name: 'Bridal Party Makeup',
        description: 'Per-face artistry for the wider party, scheduled to your morning timeline.',
        duration: 60,
        price: 300,
        priceFrom: true,
        tags: ['Per person'],
      },
      {
        slug: 'teeth-whitening',
        name: 'Cosmetic Teeth Whitening',
        description:
          'Non-peroxide LED whitening session with a shade comparison before and after.',
        duration: 60,
        price: 600,
        featured: true,
      },
      {
        slug: 'ear-piercing',
        name: 'Ear & Nose Piercing',
        description:
          'Single-use, sterile piercing with titanium jewellery and a written aftercare plan.',
        duration: 30,
        price: 200,
        priceFrom: true,
      },
      {
        slug: 'tooth-gems',
        name: 'Tooth Gems',
        description: 'Crystal placement with a dental-grade bond. Removable without damage.',
        duration: 30,
        price: 250,
      },
      {
        slug: 'waist-beads',
        name: 'Waist Beads',
        description: 'Measured, strung and fitted in-studio in your chosen palette.',
        duration: 30,
        price: 180,
        priceFrom: true,
      },
      {
        slug: 'body-contour-wrap',
        name: 'Non-Invasive Contour Wrap',
        description:
          'A sculpting wrap and lymphatic drainage session for tone and definition. Best in a course.',
        duration: 75,
        price: 650,
        tags: ['Course recommended'],
      },
      {
        slug: 'photoshoot-prep',
        name: 'Photoshoot & Camera Prep',
        description:
          'Skin prep, makeup and hair timed to your call sheet, with on-set touch-ups available.',
        duration: 150,
        price: 1200,
        priceFrom: true,
      },
    ],
  },
  {
    slug: 'beauty-institute',
    name: 'Beauty Institute & Training',
    tagline: 'Become the artist',
    summary:
      'Certified, small-cohort training with live models, business coaching and continuing mentorship.',
    intro:
      'Marilux Institute trains the technicians we would hire. Cohorts are capped, every student works on live models, and you leave with a certificate, a starter kit and twelve months of mentorship in our alumni circle.',
    ritual: [
      'Theory, sanitation and colour science',
      'Supervised practice on live models',
      'Certification, kit and business mentorship',
    ],
    mood: { accent: '#EBD6B3', from: '#2B2519', to: '#0B0A09', rgb: '235 214 179' },
    services: [
      {
        slug: 'microblading-course',
        name: 'Microblading & Powder Brows Certification',
        description:
          'Five days of theory and supervised practice covering mapping, pigment theory, skin types and healed results. Includes a professional kit.',
        duration: 2400,
        price: 8500,
        featured: true,
        tags: ['5 days', 'Kit included', 'Certificate'],
      },
      {
        slug: 'lash-course',
        name: 'Lash Extension Certification',
        description:
          'Classic through volume, including isolation, fan-making, retention science and client management.',
        duration: 1440,
        price: 5500,
        featured: true,
        tags: ['3 days', 'Kit included', 'Certificate'],
      },
      {
        slug: 'nail-tech-course',
        name: 'Nail Technician Diploma',
        description:
          'Four weeks across manicure, pedicure, acrylic, gel-x and nail art, with a salon-readiness assessment.',
        duration: 9600,
        price: 7500,
        tags: ['4 weeks', 'Kit included', 'Diploma'],
      },
      {
        slug: 'makeup-course',
        name: 'Makeup Artistry Certification',
        description:
          'Ten days covering skin prep, undertone matching on deep complexions, bridal, editorial and kit building.',
        duration: 4800,
        price: 6500,
        featured: true,
        tags: ['10 days', 'Certificate'],
      },
      {
        slug: 'wig-course',
        name: 'Wig Making & Installation Masterclass',
        description:
          'Construction, ventilation, knot bleaching, melting and cutting — from bundle to finished install.',
        duration: 2400,
        price: 4500,
        tags: ['5 days', 'Kit included'],
      },
      {
        slug: 'skincare-course',
        name: 'Facial & Skincare Therapy Certification',
        description:
          'Skin anatomy, analysis, acids, extractions, contraindications and protocol design for African skin.',
        duration: 7200,
        price: 7000,
        tags: ['3 weeks', 'Certificate'],
      },
      {
        slug: 'beauty-therapy-diploma',
        name: 'Complete Beauty Therapy Diploma',
        description:
          'Our flagship twelve-week programme spanning brows, lashes, nails, skin, waxing and body. Includes a placement in the studio.',
        duration: 28800,
        price: 18000,
        featured: true,
        tags: ['12 weeks', 'Placement', 'Diploma'],
      },
      {
        slug: 'business-masterclass',
        name: 'Business of Beauty Masterclass',
        description:
          'Two days on pricing, client retention, content, bookings and building a brand that lasts.',
        duration: 960,
        price: 2500,
        tags: ['2 days', 'Open to all levels'],
      },
    ],
  },
  {
    slug: 'beauty-packages',
    name: 'Beauty Packages',
    tagline: 'Curated in full',
    summary:
      'Multi-service experiences sequenced in the right order, at a considered price.',
    intro:
      'Booked together, treatments can be sequenced properly — wax before vajacial, facial before makeup, colour before cut. Our packages are built around that logic, and priced below the sum of their parts.',
    ritual: [
      'One conversation, one timeline',
      'Sequenced treatments across the day',
      'Refreshments, and no clock-watching',
    ],
    mood: { accent: '#D9BC8C', from: '#302518', to: '#0B0A09', rgb: '217 188 140' },
    services: [
      {
        slug: 'bridal-package',
        name: 'The Bridal Chapter',
        description:
          'A three-month lead-up: facial course, brow shaping, lash set, full body wax, spa ritual, bridal hair and makeup with trial.',
        duration: 480,
        price: 6500,
        featured: true,
        tags: ['Multi-visit', 'Planner included'],
      },
      {
        slug: 'glow-up-package',
        name: 'The Glow Edit',
        description:
          'Signature facial, brow lamination, classic lash set, gel manicure and spa pedicure in one day.',
        duration: 330,
        price: 1400,
        featured: true,
        tags: ['One day'],
      },
      {
        slug: 'maintenance-package',
        name: 'The Monthly Ritual',
        description:
          'A standing monthly appointment: facial, lash refill, gel manicure and a brow tidy — priority booking included.',
        duration: 240,
        price: 1000,
        featured: true,
        tags: ['Monthly', 'Priority booking'],
      },
      {
        slug: 'celebration-package',
        name: 'The Celebration',
        description:
          'A private group booking for up to six: makeup, nails, refreshments and a photographer hour.',
        duration: 300,
        price: 4500,
        priceFrom: true,
        tags: ['Groups of 2–6'],
      },
      {
        slug: 'mother-daughter-package',
        name: 'Mother & Daughter',
        description:
          'Two side-by-side pedicures, two facials matched to each skin age, and afternoon tea.',
        duration: 180,
        price: 1200,
        tags: ['For two'],
      },
      {
        slug: 'reset-package',
        name: 'The Full Reset',
        description:
          'Full body wax, body scrub, ninety-minute massage, vajacial and a signature facial across one long afternoon.',
        duration: 390,
        price: 2400,
        tags: ['One day'],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export const getCategory = (slug: string) =>
  SERVICE_CATEGORIES.find((c) => c.slug === slug);

export const getService = (categorySlug: string, serviceSlug: string) =>
  getCategory(categorySlug)?.services.find((s) => s.slug === serviceSlug);

export const ALL_SERVICES: Array<Service & { category: string; categorySlug: string }> =
  SERVICE_CATEGORIES.flatMap((c) =>
    c.services.map((s) => ({ ...s, category: c.name, categorySlug: c.slug })),
  );

export const FEATURED_SERVICES = ALL_SERVICES.filter((s) => s.featured);

export const TOTAL_SERVICE_COUNT = ALL_SERVICES.length;

export function formatPrice(service: Pick<Service, 'price' | 'priceFrom'>) {
  const value = new Intl.NumberFormat('en-GH', {
    maximumFractionDigits: 0,
  }).format(service.price);
  return service.priceFrom ? 'from GHS ' + value : 'GHS ' + value;
}

export function formatDuration(minutes: number) {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 480);
    if (days >= 15) return Math.round(days / 5) + ' weeks';
    return days + ' days';
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return m + ' min';
  if (m === 0) return h + ' hr';
  return h + ' hr ' + m + ' min';
}

export function depositFor(price: number) {
  return Math.round(price * 0.5);
}
