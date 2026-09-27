import { EtudeLineaire } from '../types/etude';

export const dormeurDuValEtude: EtudeLineaire = {
  title: "Le Dormeur du val – Explication linéaire",
  author: "Arthur Rimbaud",
  textLines: [
    "C'est un trou de verdure où chante une rivière,",
    "Accrochant follement aux herbes des haillons",
    "D'argent ; où le soleil, de la montagne fière,",
    "Luit : c'est un petit val qui mousse de rayons.",
    "Un soldat jeune, bouche ouverte, tête nue,",
    "Et la nuque baignant dans le frais cresson bleu,",
    "Dort ; il est étendu dans l'herbe, sous la nue,",
    "Pâle dans son lit vert où la lumière pleut.",
    "Les pieds dans les glaïeuls, il dort. Souriant comme",
    "Sourirait un enfant malade, il fait un somme :",
    "Nature, berce-le chaudement : il a froid.",
    "Les parfums ne font pas frissonner sa narine ;",
    "Il dort dans le soleil, la main sur sa poitrine,",
    "Tranquille. Il a deux trous rouges au côté droit."
  ],
  movements: [
    {
      id: "m1",
      title: "Tableau Bucolique D’un Paysage Verdoyant et Lumineux",
      citations: [
        {
          id: "m1_c1",
          citation: "« C’est un trou » (v.1) / « c’est un petit val » (v.4)",
          procede: "Présentatif + présent de description",
          interpretation: "Rimbaud donne à voir une description de la nature. Le présent accentue l’effet de tableau.",
          verses: [1, 4],
          quotes: ["C'est un trou", "c'est un petit val"]
        },
        {
          id: "m1_c2",
          citation: "« Trou de verdure » (v.1) / « rivière » (v.1) / « petit val » (v.4) / « herbes » (v.2) / « soleil » (v.3) / « montagne » (v.3)",
          procede: "Champ lexical de la nature",
          interpretation: "Tableau d’une verte vallée = portrait d’une nature lumineuse et verdoyante.",
          verses: [1, 2, 3, 4],
          quotes: ["Trou de verdure", "rivière", "petit val", "herbes", "soleil", "montagne"]
        },
        {
          id: "m1_c3",
          citation: "« Où chante une rivière » (v.1) / « où le soleil, de la montagne fière, Luit » (v.2-3) / « qui mousse de rayons » (v.4)",
          procede: "Subordonnées relatives",
          interpretation: "Précisions apportées sur cette vallée lumineuse (soleil, rayons) et rafraîchissante (rivière) = bucolique.",
          verses: [1, 2, 3, 4],
          quotes: ["Où chante une rivière", "où le soleil, de la montagne fière", "Luit", "qui mousse de rayons"]
        },
        {
          id: "m1_c4",
          citation: "« : » (v.4)",
          procede: "Ponctuation / Juxtaposition",
          interpretation: "La juxtaposition comme la subordination est au service du tableau de la nature (les deux points sont utilisés pour expliquer).",
          verses: [4],
          quotes: [":"]
        },
        {
          id: "m1_c5",
          citation: "« Chante une rivière » (v.1) / « accrochant follement » (v.2)",
          procede: "Personnification",
          interpretation: "Renforcement de la nature bucolique et idyllique qui ressemblerait au Paradis.",
          verses: [1, 2],
          quotes: ["chante une rivière", "accrochant follement"]
        },
        {
          id: "m1_c6",
          citation: "« D’argent » (v.3) « Luit » (v.4)",
          procede: "Rejets",
          interpretation: "Accents mis sur la lumière idyllique de ce tableau.",
          verses: [3, 4],
          quotes: ["D'argent", "Luit"]
        },
        {
          id: "m1_c7",
          citation: "« Une rivière » (v.1) / « aux herbes » (v.2) / « le soleil » (v.3)",
          procede: "Références élémentaires",
          interpretation: "Ce Tableau de la nature réunit les éléments en harmonie : l’eau avec la rivière, la terre avec les herbes et le feu avec le soleil et ses rayons.",
          verses: [1, 2, 3],
          quotes: ["rivière", "herbes", "soleil"]
        },
        {
          id: "m1_c8",
          citation: "« Rivière » (v.1) / « fière » (v.3)",
          procede: "Son « ière » / Rime",
          interpretation: "La rime confirme l’atmosphère de lumière et d'harmonie de ce tableau.",
          verses: [1, 3],
          quotes: ["rivière", "fière"]
        }
      ]
    },
    {
      id: "m2",
      title: "Tableau d’un Soldat",
      citations: [
        {
          id: "m2_c1",
          citation: "« Jeune, bouche ouverte, tête nue » (v.5) + tout le 2ème quatrain",
          procede: "Énumération",
          interpretation: "Rimbaud rajoute à son tableau de la nature le portrait d’un soldat.",
          verses: [5, 6, 7, 8],
          quotes: ["jeune, bouche ouverte, tête nue"]
        },
        {
          id: "m2_c2",
          citation: "« Dort » (v.7-9) / « étendu » (v.7) / « bouche ouverte » (v.5) / « somme » (v.10) / « berce » (v.11)",
          procede: "Champ lexical du sommeil",
          interpretation: "Ce tableau concerne un soldat endormi avec « Dort » mis une nouvelle fois en rejet.",
          verses: [5, 7, 9, 10, 11],
          quotes: ["Dort", "étendu", "bouche ouverte", "somme", "berce"]
        },
        {
          id: "m2_c3",
          citation: "« Dans le frais cresson » (v.6) / « dans l’herbe » (v.7) / « dans son lit vert » (v.8) / « dans les glaïeuls » (v.9)",
          procede: "Compléments circonstanciels de lieu",
          interpretation: "Le poète s’attarde sur la posture du soldat de haut en bas (tête, corps, pieds).",
          verses: [6, 7, 8, 9],
          quotes: ["dans le frais cresson", "dans l'herbe", "dans son lit vert", "dans les glaïeuls"]
        },
        {
          id: "m2_c4",
          citation: "« Lumière » / « pâle » (v.8)",
          procede: "Antithèse",
          interpretation: "Paradoxe de toute cette lumière qui laisse pourtant le soldat blafard.",
          verses: [8],
          quotes: ["lumière", "Pâle"]
        },
        {
          id: "m2_c5",
          citation: "« Bleu » (v.6) / « pleut » (v.8)",
          procede: "Hypallage + Rime",
          interpretation: "La rime jette une ombre sur le tableau idyllique du soldat (le bleu renvoie à la pâleur du soldat, le pleut casse l’impression bucolique).",
          verses: [6, 8],
          quotes: ["bleu", "pleut"]
        },
        {
          id: "m2_c6",
          citation: "2ème quatrain",
          procede: "Rimes croisées (ABAB)",
          interpretation: "Une opposition se crée au niveau sonore et rythmique continuant de nuancer le tableau idyllique.",
          verses: [5, 6, 7, 8],
          quotes: ["nue", "bleu", "nue", "pleut"]
        },
        {
          id: "m2_c7",
          citation: "« Glaïeuls » (v.9)",
          procede: "Métaphore",
          interpretation: "À la volta, Rimbaud évoque une fleur ambiguë qui renvoie autant au triomphe qu’à la mort (« la mort ou les glaïeuls » chez les gladiateurs).",
          verses: [9],
          quotes: ["glaïeuls"]
        },
        {
          id: "m2_c8",
          citation: "« Souriant comme Sourirait un enfant malade » (v.9-10)",
          procede: "Comparaison au conditionnel",
          interpretation: "Il est comparé à un enfant malade et le conditionnel annonce déjà la mort = ambiguïté.",
          verses: [9, 10],
          quotes: ["Souriant comme", "Sourirait un enfant malade"]
        },
        {
          id: "m2_c9",
          citation: "« Nature » (v.11)",
          procede: "Apostrophe / Personnification",
          interpretation: "Le poète demande à la nature de prendre en charge le soldat ce qui crée une fusion idyllique mais met l’accent sur la solitude de ce dernier.",
          verses: [11],
          quotes: ["Nature"]
        },
        {
          id: "m2_c10",
          citation: "« Chaudement » (v.11) / « froid » (v.11)",
          procede: "Antithèse",
          interpretation: "On ne sait pas s’il est si paisible physiquement finalement = ambiguïté grandissante.",
          verses: [11],
          quotes: ["chaudement", "froid"]
        }
      ]
    },
    {
      id: "m3",
      title: "Tableau Tragique d’un Soldat Mort",
      citations: [
        {
          id: "m3_c1",
          citation: "« Parfums ne font pas frissonner » (v.12)",
          procede: "Allitération en [f]",
          interpretation: "Le froid du premier tercet est confirmé au niveau sonore.",
          verses: [12],
          quotes: ["Parfums ne font pas frissonner"]
        },
        {
          id: "m3_c2",
          citation: "« Ne font pas frissonner » (v.12)",
          procede: "Négation",
          interpretation: "Il ne respire plus = annonce tragique de la mort.",
          verses: [12],
          quotes: ["Ne font pas frissonner"]
        },
        {
          id: "m3_c3",
          citation: "« Poitrine » (v.13) / « narine » (v.12)",
          procede: "Rime embrassée",
          interpretation: "Rimbaud s’attarde tragiquement sur les deux parties du corps qui accueillent la vie (le cœur et la respiration).",
          verses: [12, 13],
          quotes: ["narine", "poitrine"]
        },
        {
          id: "m3_c4",
          citation: "« Il dort » (v.13)",
          procede: "Répétition",
          interpretation: "Déjà mentionné dans les strophes précédentes, le lecteur commence à douter de ce sommeil.",
          verses: [13],
          quotes: ["Il dort"]
        },
        {
          id: "m3_c5",
          citation: "« Il dort dans le soleil » (v.13)",
          procede: "Métaphore",
          interpretation: "Référence tragique à la mort (impossible de dormir directement exposé dans le soleil).",
          verses: [13],
          quotes: ["Il dort dans le soleil"]
        },
        {
          id: "m3_c6",
          citation: "« Tranquille » (v.14)",
          procede: "Rejet",
          interpretation: "Accent mis sur la douceur de la mort mais aussi sa violence (il est désormais figé).",
          verses: [14],
          quotes: ["Tranquille"]
        },
        {
          id: "m3_c7",
          citation: "« Dort » (v.13) / « deux trous rouges » (v.14)",
          procede: "Euphémisme",
          interpretation: "Trou (tombeau, balle), rouge (sang), dort (mort) = mort tragique traitée de manière feutrée puis éclatante.",
          verses: [13, 14],
          quotes: ["dort", "deux trous rouges"]
        },
        {
          id: "m3_c8",
          citation: "Deux derniers vers",
          procede: "Allitération en [d], [t] et [r]",
          interpretation: "Effet de dureté tragique qui rompt avec la fausse tranquillité du poème (son des balles qui ont tué le soldat).",
          verses: [13, 14],
          quotes: ["Tranquille. Il a deux trous rouges au côté droit."]
        },
        {
          id: "m3_c9",
          citation: "« Rouges » (v.14)",
          procede: "Adjectif qualificatif chromatique",
          interpretation: "Après le bleu, le jaune et le vert de la nature, la couleur rouge humaine fait violemment irruption pour signifier la mort.",
          verses: [14],
          quotes: ["rouges"]
        },
        {
          id: "m3_c10",
          citation: "« Trou » (v.1) / « trous » (v.14)",
          procede: "Effet de boucle / Chiasme structural",
          interpretation: "La vallée verdoyante se transforme en tombeau et le trou initial en blessure mortelle = relecture tragique complète.",
          verses: [1, 14],
          quotes: ["trou", "trous"]
        }
      ]
    }
  ]
};
