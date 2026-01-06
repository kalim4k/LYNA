import { Product, Service } from './types';

export const LOGO_URL = "https://celinaroom.com/wp-content/uploads/2026/01/IMG-20240909-WA0029_1_-removebg-preview1.png";

export const PRODUCTS: Product[] = [
  // Thés
  {
    id: 'tea-vert',
    name: 'Thé Vert',
    category: 'tea',
    price: 1500,
    image: 'https://id-preview--6f4582b2-8bc5-4a89-8e84-f6789b42b046.lovable.app/assets/tea-vert-C_iEbOY2.jpg',
    description: 'Un thé vert riche en antioxydants, parfait pour la détoxification et le maintien d\'une bonne santé cardiovasculaire.',
  },
  {
    id: 'tea-moringa',
    name: 'Thé Moringa',
    category: 'tea',
    price: 1500,
    image: 'https://id-preview--6f4582b2-8bc5-4a89-8e84-f6789b42b046.lovable.app/assets/tea-moringa-B041JEzS.jpg',
    description: 'Le Moringa, l\'arbre de vie, en infusion pour booster votre système immunitaire et votre énergie quotidienne.',
  },
  {
    id: 'tea-gingembre',
    name: 'Thé Gingembre',
    category: 'tea',
    price: 1500,
    image: 'https://picsum.photos/seed/ginger/400/400',
    description: 'Une infusion piquante et réconfortante, idéale pour la digestion et pour combattre les coups de froid.',
  },
  {
    id: 'tea-menthe',
    name: 'Thé Menthe',
    category: 'tea',
    price: 1500,
    image: 'https://picsum.photos/seed/mint/400/400',
    description: 'La fraîcheur de la menthe pour une pause relaxante. Favorise la digestion et apaise l\'esprit.',
  },
  {
    id: 'tea-citron',
    name: 'Thé Citron',
    category: 'tea',
    price: 1500,
    image: 'https://picsum.photos/seed/lemon/400/400',
    description: 'Un zeste de vitalité. Riche en vitamine C, ce thé est parfait pour commencer la journée avec énergie.',
  },
  // Farines
  {
    id: 'fari-moringa',
    name: 'FARI-MO',
    category: 'flour',
    price: 1000, // Display price (base or middle)
    image: 'https://id-preview--6f4582b2-8bc5-4a89-8e84-f6789b42b046.lovable.app/assets/farine-moringa-C9UuYEBN.jpg',
    description: 'Farine enrichie au Moringa. Idéale pour vos bouillies et pâtisseries, apportant une valeur nutritionnelle exceptionnelle.',
    variants: [
      { label: '250g', price: 500 },
      { label: '500g', price: 1000 },
      { label: '1500g', price: 2000 },
    ]
  }
];

export const SERVICES: Service[] = [
  {
    id: 'srv-gestante',
    title: 'Conseil et suivis des gestantes',
    price: 15000,
    priceUnit: 'par trimestre',
    description: 'Accompagnement personnalisé pour une grossesse sereine.',
    image: 'https://picsum.photos/seed/pregnancy/400/400'
  },
  {
    id: 'srv-parturiante',
    title: 'Accompagnement des parturiantes',
    price: 10000,
    priceUnit: '',
    description: 'Soutien physique et émotionnel durant la période post-partum.',
    image: 'https://picsum.photos/seed/birth/400/400'
  },
  {
    id: 'srv-infantile',
    title: 'Nutrition infantile',
    price: 2000,
    priceUnit: 'par séance',
    description: 'Conseils nutritionnels adaptés pour la croissance de votre enfant.',
    image: 'https://picsum.photos/seed/babyfood/400/400'
  },
  {
    id: 'srv-ado',
    title: 'Accompagnement jeunes & ados',
    price: 5000,
    priceUnit: 'par séance',
    description: 'Écoute et orientation pour les jeunes et adolescents.',
    image: 'https://picsum.photos/seed/teens/400/400'
  },
  {
    id: 'srv-sexualite',
    title: 'Conseil couples en sexualité',
    price: 5000,
    priceUnit: 'par séance',
    description: 'Espace de dialogue et conseils pour l\'épanouissement du couple.',
    image: 'https://picsum.photos/seed/couple/400/400'
  },
  {
    id: 'srv-chronique',
    title: 'Suivi maladies chroniques',
    price: 10000,
    priceUnit: 'mensuel',
    description: 'Accompagnement et suivi personnalisé pour les personnes vivant avec des maladies chroniques.',
    image: 'https://picsum.photos/seed/health/400/400'
  }
];

export const CONTACT_INFO = {
  phone: "+14383576692",
  email: "lynaempire7@gmail.com",
  addresses: [
    { label: "Togo (Blitta)", value: "Blitta carrefour bleu" },
    { label: "Canada (Lévis)", value: "443 rue Saint-Jacques, G6W 3A1" }
  ],
  hours: {
    week: "7H30 - 19H00",
    saturday: "9H00 - 16H00"
  }
};