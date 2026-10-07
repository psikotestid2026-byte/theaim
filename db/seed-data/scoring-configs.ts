// Copied verbatim from the uploaded product seed SQL (SEED 4: scoring_configs).
// The mbti_bipolar F item list overlaps the E list in that source. It is stored unchanged.
// tm_rank_scale is the rank-band map for 170 statements. It is not an ST-30 scoring formula.
// ist and tech_js are omitted: the seed SQL has no config JSON for them.

export const SCORING_CONFIG_BY_CODE: Record<string, { formula_type: string; config_data: Record<string, unknown> }> = {
  "mbti": {
    "formula_type": "mbti_bipolar",
    "config_data": {
      "dimensions": [
        "EI",
        "SN",
        "TF",
        "JP"
      ],
      "keys": {
        "E": {
          "pairs": [
            1,
            6,
            11,
            16,
            21,
            26,
            31,
            36,
            41,
            46,
            51,
            56,
            61,
            66,
            71,
            76,
            81,
            86,
            91
          ]
        },
        "I": {
          "pairs": [
            2,
            7,
            12,
            17,
            22,
            27,
            32,
            37,
            42,
            47,
            52,
            57,
            62,
            67,
            72,
            77,
            82,
            87,
            92
          ]
        },
        "S": {
          "pairs": [
            3,
            8,
            13,
            18,
            23,
            28,
            33,
            38,
            43,
            48,
            53,
            58,
            63,
            68,
            73,
            78,
            83,
            88,
            93
          ]
        },
        "N": {
          "pairs": [
            4,
            9,
            14,
            19,
            24,
            29,
            34,
            39,
            44,
            49,
            54,
            59,
            64,
            69,
            74,
            79,
            84,
            89
          ]
        },
        "T": {
          "pairs": [
            5,
            10,
            15,
            20,
            25,
            30,
            35,
            40,
            45,
            50,
            55,
            60,
            65,
            70,
            75,
            80,
            85,
            90
          ]
        },
        "F": {
          "pairs": [
            41,
            46,
            51,
            56,
            61,
            66,
            71,
            76,
            81,
            86,
            91
          ]
        },
        "J": {
          "pairs": [
            23,
            28,
            33,
            38,
            43,
            48,
            53,
            58,
            63,
            68,
            73,
            78,
            83,
            88,
            93
          ]
        },
        "P": {
          "pairs": [
            24,
            29,
            34,
            39,
            44,
            49,
            54,
            59,
            64,
            69,
            74,
            79,
            84,
            89
          ]
        }
      },
      "result_map": {
        "ESTJ": "The Executive",
        "ESTP": "The Entrepreneur",
        "ESFJ": "The Consul",
        "ESFP": "The Entertainer",
        "ENTJ": "The Commander",
        "ENTP": "The Debater",
        "ENFJ": "The Protagonist",
        "ENFP": "The Campaigner",
        "ISTJ": "The Logistician",
        "ISTP": "The Virtuoso",
        "ISFJ": "The Defender",
        "ISFP": "The Adventurer",
        "INTJ": "The Architect",
        "INTP": "The Logician",
        "INFJ": "The Advocate",
        "INFP": "The Mediator"
      }
    }
  },
  "disc": {
    "formula_type": "disc_most_least",
    "config_data": {
      "total_blocks": 28,
      "dimensions": {
        "D": {
          "name": "Dominance",
          "color": "#ef4444"
        },
        "I": {
          "name": "Influence",
          "color": "#f97316"
        },
        "S": {
          "name": "Steadiness",
          "color": "#22c55e"
        },
        "C": {
          "name": "Conscientiousness",
          "color": "#3b82f6"
        }
      },
      "profiles": {
        "D": "Dominan — Langsung, Tegas, Berorientasi Hasil",
        "I": "Influential — Ekspresif, Optimis, Sosial",
        "S": "Steady — Sabar, Loyal, Konsisten",
        "C": "Conscientious — Analitis, Akurat, Sistematis"
      }
    }
  },
  "bigfive": {
    "formula_type": "bigfive_matrix",
    "config_data": {
      "dimensions": {
        "O": {
          "name": "Openness",
          "max": 50,
          "items": [
            5,
            10,
            15,
            20,
            25,
            30,
            35,
            40,
            41,
            44
          ],
          "reversed": [
            35,
            41
          ]
        },
        "C": {
          "name": "Conscientiousness",
          "max": 45,
          "items": [
            3,
            8,
            13,
            18,
            23,
            28,
            33,
            38,
            43
          ],
          "reversed": [
            8,
            18,
            23,
            43
          ]
        },
        "E": {
          "name": "Extraversion",
          "max": 40,
          "items": [
            1,
            6,
            11,
            16,
            21,
            26,
            31,
            36
          ],
          "reversed": [
            6,
            21,
            31
          ]
        },
        "A": {
          "name": "Agreeableness",
          "max": 45,
          "items": [
            2,
            7,
            12,
            17,
            22,
            27,
            32,
            37,
            42
          ],
          "reversed": [
            2,
            12,
            27,
            37
          ]
        },
        "N": {
          "name": "Neuroticism",
          "max": 40,
          "items": [
            4,
            9,
            14,
            19,
            24,
            29,
            34,
            39
          ],
          "reversed": [
            9,
            24,
            34
          ]
        }
      },
      "categories": {
        "low": {
          "max": 33,
          "label": "Rendah"
        },
        "mid": {
          "max": 66,
          "label": "Sedang"
        },
        "high": {
          "max": 100,
          "label": "Tinggi"
        }
      }
    }
  },
  "talents_mapping": {
    "formula_type": "tm_rank_scale",
    "config_data": {
      "total_statements": 170,
      "themes": 34,
      "statements_per_theme": 5,
      "scale": {
        "min": 1,
        "max": 5
      },
      "dominant_count": 7,
      "supporting_count": 7,
      "theme_codes": [
        "ACH",
        "ACT",
        "ADA",
        "ANA",
        "ARR",
        "BEL",
        "CMD",
        "COM",
        "CMP",
        "CON",
        "CST",
        "CTX",
        "DEL",
        "DEV",
        "DIS",
        "EMP",
        "FOC",
        "FUT",
        "HAR",
        "IDE",
        "INC",
        "IND",
        "INP",
        "INT",
        "LRN",
        "MAX",
        "POS",
        "REL",
        "RES",
        "RST",
        "SAU",
        "SIG",
        "STR",
        "WOO"
      ],
      "level_map": {
        "dominant": {
          "min_rank": 1,
          "max_rank": 7,
          "color": "red"
        },
        "supporting": {
          "min_rank": 8,
          "max_rank": 14,
          "color": "yellow"
        },
        "neutral": {
          "min_rank": 15,
          "max_rank": 20,
          "color": "white"
        },
        "weak": {
          "min_rank": 21,
          "max_rank": 27,
          "color": "grey"
        },
        "very_weak": {
          "min_rank": 28,
          "max_rank": 34,
          "color": "black"
        }
      }
    }
  },
  "riasec": {
    "formula_type": "riasec_scale",
    "config_data": {
      "types": {
        "R": "Realistic",
        "I": "Investigative",
        "A": "Artistic",
        "S": "Social",
        "E": "Enterprising",
        "C": "Conventional"
      },
      "total_items": 108
    }
  },
  "enneagram": {
    "formula_type": "enneagram_scale",
    "config_data": {
      "types": 9,
      "total_items": 180,
      "wing_pairs": {
        "1": [
          "1w9",
          "1w2"
        ],
        "2": [
          "2w1",
          "2w3"
        ],
        "3": [
          "3w2",
          "3w4"
        ],
        "4": [
          "4w3",
          "4w5"
        ],
        "5": [
          "5w4",
          "5w6"
        ],
        "6": [
          "6w5",
          "6w7"
        ],
        "7": [
          "7w6",
          "7w8"
        ],
        "8": [
          "8w7",
          "8w9"
        ],
        "9": [
          "9w8",
          "9w1"
        ]
      }
    }
  },
  "wpt": {
    "formula_type": "wpt_correct_count",
    "config_data": {
      "total_items": 50,
      "time_limit_sec": 720,
      "scoring": "correct_count",
      "norms": {
        "iq_range": [
          {
            "min": 0,
            "max": 10,
            "label": "Di Bawah Rata-rata"
          },
          {
            "min": 11,
            "max": 18,
            "label": "Rata-rata Rendah"
          },
          {
            "min": 19,
            "max": 24,
            "label": "Rata-rata"
          },
          {
            "min": 25,
            "max": 30,
            "label": "Di Atas Rata-rata"
          },
          {
            "min": 31,
            "max": 50,
            "label": "Sangat Tinggi"
          }
        ]
      }
    }
  },
  "msdt": {
    "formula_type": "msdt_scale",
    "config_data": {
      "styles": {
        "E": "Executive",
        "Au": "Autocrat",
        "Ba": "Benevolent Autocrat",
        "Bu": "Bureaucrat",
        "Co": "Compromiser",
        "Ds": "Deserter",
        "Dv": "Developer",
        "Mi": "Missionary"
      },
      "effective_styles": [
        "E",
        "Ba",
        "Dv"
      ],
      "ineffective_styles": [
        "Au",
        "Bu",
        "Co",
        "Ds",
        "Mi"
      ]
    }
  },
  "papi": {
    "formula_type": "papi_scale",
    "config_data": {
      "aspects": {
        "G": "Hard Intense Worker",
        "L": "Leadership Role",
        "I": "Ease in Decision Making",
        "T": "Pace / Tempo",
        "V": "Vigour",
        "S": "Social Extensiveness",
        "R": "Theoretical Type",
        "D": "Detail Conscious",
        "C": "Organized Type",
        "E": "Emotional Restraint",
        "N": "Need to Finish a Task",
        "A": "Need for Achievement",
        "P": "Need to Control Others",
        "X": "Need for Recognition",
        "B": "Need to Belong to Groups",
        "O": "Need for Closeness",
        "Z": "Need for Change",
        "K": "Need for Aggression",
        "F": "Need for Support",
        "W": "Need for Rules"
      },
      "total_items": 90
    }
  },
  "msai": {
    "formula_type": "msai_scale",
    "config_data": {
      "skills": [
        "Managing Teams",
        "Managing Innovation",
        "Managing the Future",
        "Energising Employees",
        "Managing Coordination",
        "Managing Acculturation",
        "Managing Competitiveness",
        "Managing Customer Services",
        "Managing the Control System",
        "Managing Continuous Improvement",
        "Managing the Development of Others",
        "Managing Interpersonal Relationships"
      ],
      "quadrants": {
        "Clan": "Klan",
        "Adhocracy": "Adhokrasi",
        "Market": "Pasar",
        "Hierarchy": "Hierarki"
      }
    }
  }
};

