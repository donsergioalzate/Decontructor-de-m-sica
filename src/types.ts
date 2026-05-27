export interface SongMetadata {
  title: string;
  artist: string;
  releasedYear: string;
  genre: string;
  tempo: string;
  key: string;
  durationEstimate: string;
}

export interface EmotionalAnalysis {
  vibeDescription: string;
  primaryEmotions: string[];
  emotionalJourney: string;
  energyLevel: number; // 1 to 10
  positivityValence: number; // 1 to 10
  synesthesiaColor: string;
  synesthesiaReasoning: string;
}

export interface InstrumentItem {
  instrument: string;
  role: string;
  details: string;
}

export interface Instrumentation {
  rhythmSection: InstrumentItem[];
  leadMelodyInstruments: InstrumentItem[];
  harmonyAccompanying: InstrumentItem[];
  synthesizersAndEffects: InstrumentItem[];
  vocalArrangement: string;
}

export interface DynamicSection {
  section: string;
  timestampRange: string;
  description: string;
  productionHighlight: string;
}

export interface MixingTechnique {
  aspect: string;
  description: string;
}

export interface ProductionDeconstruction {
  dynamicStructure: DynamicSection[];
  mixingTechniques: MixingTechnique[];
  keyProductionDetails: string[];
}

export interface OverallTriviaAndImpact {
  impactTrivia: string[];
}

export interface SongAnalysisResponse {
  metadata: SongMetadata;
  emotionalAnalysis: EmotionalAnalysis;
  instrumentation: Instrumentation;
  productionDeconstruction: ProductionDeconstruction;
  overallTriviaAndImpact: OverallTriviaAndImpact;
  textReportFormatted: string;
}
