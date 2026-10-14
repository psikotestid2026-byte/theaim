export type IstExample = {
  stem?: string;
  options?: string[];
  key: string;
};

/** Subtest clock and labels. The memorize word list is not part of this type. */
export type IstScheduleEntry = {
  code: string;
  name: string;
  from: number;
  to: number;
  timeLimitSec: number;
  memorizeSec?: number;
};

/** What the runner may receive. Never includes the ME memorize word list. */
export type IstSubtestPublic = IstScheduleEntry & {
  instructions: string;
  examples: IstExample[];
  exampleImage?: string;
};

export type IstMemorizeList = Record<string, string[]>;

export const IST_AGE_GROUPS = ["21-25", "26-30", "31-35", "36-40"] as const;
export type IstAgeGroup = (typeof IST_AGE_GROUPS)[number];

export const IST_SUBTEST_CODES = ["SE", "WA", "AN", "GE", "RA", "ZR", "FA", "WU", "ME"] as const;
export type IstSubtestCode = (typeof IST_SUBTEST_CODES)[number];

export type IstIqCategory = {
  label: string;
  iq_min?: number;
  iq_max?: number;
};

/** Norms and conversion tables loaded from scoring_configs + test_norms. No item keys. */
export type IstScoringTables = {
  subtests: { code: string; name: string }[];
  geRawToRw: number[];
  rwToSw: Record<IstAgeGroup, Record<string, (number | null)[]>>;
  gesamt: Record<IstAgeGroup, number[][]>;
  swToIq: number[][];
  categories: IstIqCategory[];
  provisionalItems: number[];
};
