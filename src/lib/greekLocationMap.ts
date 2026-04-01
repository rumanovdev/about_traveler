// Mapping of Greek location names: English ↔ Greek (all forms)
// Each entry has all known variants so search matches regardless of language

const locationAliases: string[][] = [
  // Cyclades
  ["syros", "σύρος", "σύρου", "σύρο", "ermoupoli", "ερμούπολη", "ερμουπολη", "ερμούπολης"],
  ["mykonos", "μύκονος", "μυκόνου", "μυκονο", "μύκονο"],
  ["santorini", "thira", "σαντορίνη", "σαντορινη", "θήρα", "θηρα"],
  ["paros", "πάρος", "παρο", "πάρο", "παρου", "πάρου"],
  ["naxos", "νάξος", "ναξο", "νάξο", "ναξου", "νάξου"],
  ["ios", "ίος", "ιος"],
  ["milos", "μήλος", "μηλο", "μήλο", "μήλου"],
  ["tinos", "τήνος", "τηνο", "τήνο", "τήνου"],
  ["andros", "άνδρος", "ανδρο", "άνδρο", "άνδρου"],
  ["amorgos", "αμοργός", "αμοργο", "αμοργού"],
  ["folegandros", "φολέγανδρος", "φολεγανδρο", "φολέγανδρο"],
  ["sifnos", "σίφνος", "σιφνο", "σίφνο", "σίφνου"],
  ["serifos", "σέριφος", "σεριφο", "σέριφο"],
  ["kea", "κέα"],
  ["kimolos", "κίμωλος", "κιμωλο"],
  ["koufonisia", "κουφονήσια", "κουφονησια"],
  ["antiparos", "αντίπαρος", "αντιπαρο"],
  ["donousa", "δονούσα", "δονουσα"],
  ["sikinos", "σίκινος", "σικινο"],
  ["anafi", "ανάφη", "αναφη"],

  // Dodecanese
  ["rhodes", "rodos", "ρόδος", "ροδο", "ρόδο", "ρόδου"],
  ["kos", "κως", "κω"],
  ["patmos", "πάτμος", "πατμο", "πάτμο"],
  ["leros", "λέρος", "λερο", "λέρο"],
  ["kalymnos", "κάλυμνος", "καλυμνο", "κάλυμνο"],
  ["karpathos", "κάρπαθος", "καρπαθο", "κάρπαθο"],
  ["symi", "σύμη", "συμη"],
  ["tilos", "τήλος", "τηλο"],
  ["astypalaia", "αστυπάλαια", "αστυπαλαια"],
  ["nisyros", "νίσυρος", "νισυρο"],
  ["kasos", "κάσος", "κασο"],
  ["chalki", "χάλκη", "χαλκη"],
  ["lipsi", "λειψοί", "λειψοι"],

  // Ionian
  ["corfu", "kerkyra", "κέρκυρα", "κερκυρα"],
  ["zakynthos", "zante", "ζάκυνθος", "ζακυνθο", "ζάκυνθο"],
  ["kefalonia", "cephalonia", "κεφαλονιά", "κεφαλονια"],
  ["lefkada", "λευκάδα", "λευκαδα"],
  ["paxos", "παξοί", "παξοι", "παξο"],
  ["ithaca", "ithaki", "ιθάκη", "ιθακη"],

  // Saronic
  ["aegina", "αίγινα", "αιγινα"],
  ["hydra", "ύδρα", "υδρα"],
  ["spetses", "σπέτσες", "σπετσες"],
  ["poros", "πόρος", "πορο", "πόρο"],
  ["agistri", "αγκίστρι", "αγκιστρι"],

  // North Aegean
  ["lesvos", "lesbos", "mytilene", "λέσβος", "λεσβο", "μυτιλήνη", "μυτιληνη"],
  ["chios", "χίος", "χιο", "χίο"],
  ["samos", "σάμος", "σαμο", "σάμο"],
  ["ikaria", "ικαρία", "ικαρια"],
  ["limnos", "lemnos", "λήμνος", "λημνο"],
  ["thassos", "θάσος", "θασο", "θάσο"],
  ["samothrace", "samothraki", "σαμοθράκη", "σαμοθρακη"],

  // Sporades
  ["skiathos", "σκιάθος", "σκιαθο", "σκιάθο"],
  ["skopelos", "σκόπελος", "σκοπελο", "σκόπελο"],
  ["alonissos", "αλόννησος", "αλοννησο"],
  ["skyros", "σκύρος", "σκυρο", "σκύρο"],

  // Crete
  ["crete", "kriti", "κρήτη", "κρητη"],
  ["heraklion", "iraklion", "ηράκλειο", "ηρακλειο"],
  ["chania", "χανιά", "χανια"],
  ["rethymno", "rethymnon", "ρέθυμνο", "ρεθυμνο"],
  ["agios nikolaos", "άγιος νικόλαος"],
  ["elounda", "ελούντα", "ελουντα"],

  // Major cities
  ["athens", "athina", "αθήνα", "αθηνα"],
  ["thessaloniki", "θεσσαλονίκη", "θεσσαλονικη"],
  ["piraeus", "peiraia", "πειραιάς", "πειραιας"],
  ["glyfada", "γλυφάδα", "γλυφαδα"],
  ["voula", "βούλα", "βουλα"],
  ["vouliagmeni", "βουλιαγμένη", "βουλιαγμενη"],
  ["rafina", "ραφήνα", "ραφηνα"],
  ["lavrio", "λαύριο", "λαυριο"],

  // Mainland / Peloponnese
  ["nafplio", "nauplio", "ναύπλιο", "ναυπλιο"],
  ["monemvasia", "μονεμβασιά", "μονεμβασια"],
  ["kalamata", "καλαμάτα", "καλαματα"],
  ["olympia", "ολυμπία", "ολυμπια"],
  ["delphi", "δελφοί", "δελφοι"],
  ["meteora", "μετέωρα", "μετεωρα"],
  ["pelion", "πήλιο", "πηλιο"],
  ["halkidiki", "χαλκιδική", "χαλκιδικη"],
  ["kavala", "καβάλα", "καβαλα"],
  ["alexandroupoli", "αλεξανδρούπολη", "αλεξανδρουπολη"],
  ["ioannina", "γιάννενα", "γιαννενα", "ιωάννινα", "ιωαννινα"],
  ["larissa", "λάρισα", "λαρισα"],
  ["volos", "βόλος", "βολο", "βόλο"],
  ["patras", "patra", "πάτρα", "πατρα"],
  ["corinth", "korinthos", "κόρινθος", "κορινθο"],

  // Popular areas
  ["poseidonia", "ποσειδωνία", "ποσειδωνια"],
  ["kini", "κίνι", "κινι"],
  ["finikas", "φοίνικας", "φοινικας"],
  ["galissas", "γαλησσάς", "γαλησσας"],
  ["vari", "βάρη", "βαρη"],
];

// Build a fast lookup: word → list of all aliases
const aliasMap = new Map<string, string[]>();
for (const group of locationAliases) {
  for (const word of group) {
    aliasMap.set(word.toLowerCase(), group);
  }
}

/**
 * Given a search query, returns an expanded set of search words
 * including all Greek/English aliases for recognized location names.
 */
export function expandLocationQuery(query: string): string[] {
  const words = query.toLowerCase().split(/[,\s]+/).filter((w) => w.length >= 2);
  const expanded = new Set<string>(words);

  for (const word of words) {
    const aliases = aliasMap.get(word);
    if (aliases) {
      for (const alias of aliases) {
        expanded.add(alias);
      }
    }
  }

  return Array.from(expanded);
}
