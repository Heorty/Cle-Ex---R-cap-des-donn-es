export interface ProjectConfig {
  title: string;
  subtitle: string;
  promo: string;
  targetAudience: number;
  description: string;
  swipeBatchSize: number;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionDef {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  required?: boolean;
  phase: 'initial' | 'post_swipe';
  options?: QuestionOption[];
  maxSelect?: number;
  placeholder?: string;
}

export interface InspirationPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  fallbackGradient: string;
  description: string;
  tags: string[];
}

export interface SuperlikeNote {
  element?: string;
  reason?: string;
}

export interface Respondent {
  buque: string;
  famss: string;
  answers: {
    pre_connaissance?: string;
    pre_representation?: string;
    pre_importance?: string;
    pre_representation_promss?: string;
    post_interet?: string;
    post_elements_vus?: string[];
    post_elements_vus_autre?: string;
    post_taille_signification?: string[];
    post_taille_signification_autre?: string;
    post_materiaux?: string[];
    post_innovation?: string[];
    post_originalite?: string;
    post_boite_a_idees?: string;
  };
  swipes: Record<string, 'like' | 'dislike' | 'superlike'>;
  superlikeNotes: Record<string, SuperlikeNote>;
  submittedAt: string;
  updatedAt: string;
}

export const surveyProject: ProjectConfig = {
  title: "Questionnaire de Consultation : Projet Clé d'Ex",
  subtitle: "Idéation, Consultation & Sélection d'Inspirations",
  promo: "Cl225",
  targetAudience: 163,
  description: "La clé d'Ex est l'œuvre collective emblématique de notre promotion. Ce questionnaire préliminaire, la sélection d'inspirations et les questions secondaires permettent de recueillir la vision et les envies de chacun.",
  swipeBatchSize: 30
};

export const surveyQuestions: QuestionDef[] = [
  {
    id: "pre_connaissance",
    title: "1. Comment évalues-tu ton niveau de connaissance actuel sur les clés d'Ex ?",
    subtitle: "Questionnaire préliminaire",
    type: "single_choice",
    required: true,
    phase: "initial",
    options: [
      { value: "jamais_entendu_parler", label: "Jamais entendu parler" },
      { value: "vois_rapidement", label: "Je vois rapidement ce que c'est" },
      { value: "deja_vu_quelques_unes", label: "J'en ai déjà vu quelques-unes" },
      { value: "comprends_parfaitement", label: "Je comprends le symbole et le processus de fabrication" }
    ]
  },
  {
    id: "pre_representation",
    title: "2. Que représente la clé d'Ex pour toi, sur le plan symbolique ?",
    subtitle: "Réponse libre",
    type: "text",
    required: false,
    phase: "initial",
    placeholder: "Partage ce que la clé d'Ex représente pour toi, sur le plan symbolique..."
  },
  {
    id: "pre_importance",
    title: "3. À quel moment juges-tu important que notre prom'ss ait fini sa clé d'Ex ?",
    subtitle: "Questionnaire préliminaire",
    type: "single_choice",
    required: true,
    phase: "initial",
    options: [
      { value: "pas_une_priorite", label: "Ce n'est pas une priorité pour moi" },
      { value: "prete_retour_25ans", label: "L'important est qu'elle soit prête pour notre retour dans 25 ans" },
      { value: "finie_d_ici_1_a_2_ans", label: "Il faudrait qu'elle soit finie d'ici quelques années" },
      { value: "absolument_pour_ex_0", label: "Il faut absolument l'avoir pour la fin de la vie a l'ec'ss (Ex = 0)" }
    ]
  },
  {
    id: "pre_representation_promss",
    title: "4. La clé d'Ex doit être le miroir de notre promotion. Quels éléments devraient y figurer ?",
    subtitle: "Réponse libre",
    type: "text",
    required: false,
    phase: "initial",
    placeholder: "Éléments de notre histoire, de nos anecdotes ou de notre identité à y faire figurer..."
  },
  {
    id: "post_interet",
    title: "1. Maintenant que tu as vu plusieurs exemples de clés, quel est ton niveau d'intérêt pour le projet de création de notre clé ?",
    subtitle: "Questions secondaires",
    type: "single_choice",
    required: true,
    phase: "post_swipe",
    options: [
      { value: "toujours_peu_interesse", label: "Toujours peu intéressé" },
      { value: "curieux_voir_propositions", label: "Curieux de voir les projets proposés" },
      { value: "envie_investir_activement", label: "Motiv'ss (s'investir activement dans la conception / fabrication)" }
    ]
  },
  {
    id: "post_elements_vus",
    title: "2. Parmi les clés d'Ex présentées, quels aspects t'ont le plus séduit ?",
    subtitle: "Sélectionne les aspects qui t'ont le plus séduit (choix multiple)",
    type: "multiple_choice",
    maxSelect: 5,
    required: true,
    phase: "post_swipe",
    options: [
      { value: "proportions_design_classiques", label: "Les proportions et le design des clés classiques" },
      { value: "concepts_atypiques_modernes", label: "Les concepts atypiques ou modernes" },
      { value: "types_materiaux_utilises", label: "Les types de matériaux utilisés (bois, métal, composite)" },
      { value: "integration_fonctionnalites", label: "L'intégration de fonctionnalités (éclairage, modularité)" },
      { value: "autres", label: "Autres" }
    ]
  },
  {
    id: "post_taille_signification",
    title: "3. La taille de la clé est historiquement symbolique. En équilibrant l'esthétique et l'aspect pratique (stockage, transport), quelle dimension préfères-tu ?",
    subtitle: "Réponses multiples possibles",
    type: "multiple_choice",
    maxSelect: 5,
    required: true,
    phase: "post_swipe",
    options: [
      { value: "hauteur_225cm", label: "225 cm de haut (symbole Cl225)" },
      { value: "taille_moyenne_promss", label: "Taille moyenne de la promotion" },
      { value: "milieu_knass_pompss", label: "Milieu entre le Kna'ss et le Pomp's" },
      { value: "taille_knass", label: "Taille du Kna'ss (le plus petit)" },
      { value: "taille_pompss", label: "Taille de la Pomp'ss (le plus grand)" },
      { value: "autres", label: "Autres" }
    ]
  },
  {
    id: "post_materiaux",
    title: "4. Sur le plan des matériaux et de la direction technique, vers quelle esthétique souhaites-tu que l'on s'oriente ?",
    subtitle: "Réponses multiples possibles",
    type: "multiple_choice",
    maxSelect: 4,
    required: true,
    phase: "post_swipe",
    options: [
      { value: "traditionnelle_noble", label: "Traditionnelle noble (bois sculpté ou usiné)" },
      { value: "combinaison_bimateriau", label: "Combinaison bimatériau (bois et métal, etc.)" },
      { value: "industrielle", label: "Industrielle (acier, alu, métaux forgés/polis)" },
      { value: "contemporaine_composite", label: "Contemporaine ou composite (résine, fibre, etc.)" }
    ]
  },
  {
    id: "post_innovation",
    title: "5. Souhaites-tu intégrer des touches d'innovation ou de modernité technologique dans la conception ?",
    subtitle: "Réponses multiples possibles",
    type: "multiple_choice",
    maxSelect: 4,
    required: true,
    phase: "post_swipe",
    options: [
      { value: "eclairage_retro_integre", label: "Éclairage ou rétroéclairage intégré" },
      { value: "mecanisme_articule_mobile", label: "Mécanisme articulé ou éléments mécaniques mobiles" },
      { value: "composants_interactifs_numeriques", label: "Composants interactifs (son, cloche, etc.)" },
      { value: "artisanale_traditionnelle_100", label: "Rester sur une réalisation 100 % artisanale et traditionnelle" }
    ]
  },
  {
    id: "post_originalite",
    title: "6. Si nous devions ajouter une touche d'originalité unique à notre clé, quelle serait ton idée ?",
    subtitle: "Réponse libre",
    type: "text",
    required: false,
    phase: "post_swipe",
    placeholder: "Partage ton idée d'originalité unique (secret caché, modularité, fonctionnalité...)"
  },
  {
    id: "post_boite_a_idees",
    title: "7. Boîte à idées générale",
    subtitle: "Réponse libre",
    type: "text",
    required: false,
    phase: "post_swipe",
    placeholder: "Idées, remarques, suggestions pour la réalisation collective de notre clé d'Ex..."
  }
];

export const knownHistoricalKeys: Record<string, { label: string; center: string; year: string; description: string }> = {
  "photo_120_im_cl___cl139_jpg": { label: "Clé Cluny 139 (Cl139)", center: "Cluny", year: "1939 / Cl139", description: "Clé mythique devenue logo officiel de l'AHCLAM, chef-d'œuvre de symbolisme et sculpture d'une finesse légendaire." },
  "photo_120_im_cl___cl191_jpg": { label: "Clé Cluny 191 (Cl191)", center: "Cluny", year: "1991 / Cl191", description: "Tige torsadée hélicoïdale spectaculaire et intégration sculptée des clochers et tympans de l'Abbaye de Cluny." },
  "photo_120_im_cl___cl196_jpg": { label: "Clé Cluny 196 (Cl196)", center: "Cluny", year: "1996 / Cl196", description: "Tête sculptée en cage contenant l'AM Trad's, socle architectural bimatériau très apprécié." },
  "photo_120_im_cl___cl111_jpg": { label: "Clé Cluny 111 (Cl111)", center: "Cluny", year: "1911 / Cl111", description: "Sculpture ornementale riche avec bas-reliefs volumineux et anneau supérieur à volutes gothiques." },
  "photo_120_im_cl___cl110_jpg": { label: "Clé Cluny 110 (Cl110)", center: "Cluny", year: "1910 / Cl110", description: "Richesse et finesse des détails sculptés sur la tête et l'anneau, modèle classique d'ébénisterie." },
  "photo_120_im_cl___cl134_jpg": { label: "Clé Cluny 134 (Cl134)", center: "Cluny", year: "1934 / Cl134", description: "Sculptures végétales en feuilles d'acanthe le long de la tige et équilibre des proportions." },
  "photo_120_im_cl___cl155_jpg": { label: "Clé Cluny 155 (Cl155)", center: "Cluny", year: "1955 / Cl155", description: "DA très consistante avec zapointe entourée d'arcs, fort hommage au Tabagn'ss." },
  "photo_120_im_cl___cl136_jpg": { label: "Clé Cluny 136 (Cl136)", center: "Cluny", year: "1936 / Cl136", description: "Lignes pures et travail soigné du bois noble massif." },
  "photo_120_im_cl___cl126_jpg": { label: "Clé Cluny 126 (Cl126)", center: "Cluny", year: "1926 / Cl126", description: "Finesse d'ajourage et silhouette élancée de clé classique." },
  "photo_120_im_cl___cl120_jpg": { label: "Clé Cluny 120 (Cl120)", center: "Cluny", year: "1920 / Cl120", description: "Proportions majestueuses avec anneau en rosace sculptée." },
  "photo_120_im_cl___cl122_jpg": { label: "Clé Cluny 122 (Cl122)", center: "Cluny", year: "1922 / Cl122", description: "Style classique épuré avec gravures régulières sur le fût." },
  "photo_120_im_cl___cl149_jpg": { label: "Clé Cluny 149 (Cl149)", center: "Cluny", year: "1949 / Cl149", description: "Insertion d'un globe en cuivre au centre, pionnière du bimatériau." },
  "photo_120_im_cl___cl195_jpg": { label: "Clé Cluny 195 (Cl195)", center: "Cluny", year: "1995 / Cl195", description: "Courbures organiques et intégration d'éléments techniques modernes." },
  "photo_120_im_cl___cl183_jpg": { label: "Clé Cluny 183 (Cl183)", center: "Cluny", year: "1983 / Cl183", description: "Design audacieux des années 80 avec reliefs géométriques." },
  "photo_120_im_cl___cl178_jpg": { label: "Clé Cluny 178 (Cl178)", center: "Cluny", year: "1978 / Cl178", description: "Contraste marqué et fût texturé." },
  "photo_120_im_cl___cl182_jpg": { label: "Clé Cluny 182 (Cl182)", center: "Cluny", year: "1982 / Cl182", description: "Corps en maillons de chaîne métalliques symbolisant la cohertion." },
  "photo_am_trads_arrondi_svg": { label: "Symbole AM Trad'ss (Arrondi)", center: "Tradition Gadzarts", year: "Emblème", description: "Emblème iconique de la tradition des Arts et Métiers récurrent sur les clés." }
};
