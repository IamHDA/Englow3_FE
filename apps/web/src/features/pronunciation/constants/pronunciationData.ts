import { IpaChartSound } from "../types";

/**
 * Bảng âm vị tiếng Anh. Tĩnh, và đúng là phải tĩnh: đây là bảng IPA, không phải
 * số liệu của người học.
 *
 * Cờ `isMastered` đã bị bỏ. Nó tô xanh những âm người học "đã thạo", trong khi
 * không có gì trong hệ thống đo điều đó - điểm chấm là theo từng bản ghi, chưa
 * bao giờ cộng dồn theo âm vị.
 */
export const IPA_CHART: IpaChartSound[] = [
  // Monophthongs
  {
    symbol: "/iː/",
    example: "see, eat",
    type: "monophthong",
  },
  { symbol: "/ɪ/", example: "sit, bit", type: "monophthong" },
  { symbol: "/e/", example: "bed, red", type: "monophthong" },
  {
    symbol: "/æ/",
    example: "cat, bad",
    type: "monophthong",
  },
  { symbol: "/ʌ/", example: "cup, but", type: "monophthong" },
  {
    symbol: "/ɑː/",
    example: "father, car",
    type: "monophthong",
  },
  { symbol: "/ɒ/", example: "hot, pot", type: "monophthong" },
  {
    symbol: "/ɔː/",
    example: "call, four",
    type: "monophthong",
  },
  {
    symbol: "/ʊ/",
    example: "put, foot",
    type: "monophthong",
  },
  {
    symbol: "/uː/",
    example: "too, food",
    type: "monophthong",
  },
  {
    symbol: "/ɜː/",
    example: "bird, word",
    type: "monophthong",
  },
  {
    symbol: "/ə/",
    example: "about, ago",
    type: "monophthong",
  },

  // Consonants
  {
    symbol: "/θ/",
    example: "think, bath",
    type: "consonant",
  },
  {
    symbol: "/ð/",
    example: "this, mother",
    type: "consonant",
  },
  { symbol: "/ʃ/", example: "she, cash", type: "consonant" },
  {
    symbol: "/ʒ/",
    example: "measure, vision",
    type: "consonant",
  },
  {
    symbol: "/tʃ/",
    example: "chip, watch",
    type: "consonant",
  },
  {
    symbol: "/dʒ/",
    example: "jam, judge",
    type: "consonant",
  },
  { symbol: "/ŋ/", example: "sing, long", type: "consonant" },
];
