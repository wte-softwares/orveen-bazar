export { cn } from "cn";

/**
 * Transliteration map for Bengali unicode characters to Latin phonetics.
 */
const BANGLA_TO_LATIN_MAP: Record<string, string> = {
  // Vowels
  "অ": "o",
  "আ": "a",
  "ই": "i",
  "ঈ": "ee",
  "উ": "u",
  "ঊ": "oo",
  "ঋ": "ri",
  "এ": "e",
  "ঐ": "oi",
  "ও": "o",
  "ঔ": "ou",

  // Consonants
  "ক": "k",
  "খ": "kh",
  "গ": "g",
  "ঘ": "gh",
  "ঙ": "ng",
  "চ": "ch",
  "ছ": "chh",
  "জ": "j",
  "ঝ": "jh",
  "ঞ": "y",
  "ট": "t",
  "ঠ": "th",
  "ড": "d",
  "ঢ": "dh",
  "ণ": "n",
  "ত": "t",
  "থ": "th",
  "দ": "d",
  "ধ": "dh",
  "ন": "n",
  "প": "p",
  "ফ": "ph",
  "ব": "b",
  "ভ": "bh",
  "ম": "m",
  "য": "j",
  "র": "r",
  "ল": "l",
  "শ": "sh",
  "ষ": "sh",
  "স": "s",
  "হ": "h",
  "ড়": "r",
  "ঢ়": "rh",
  "য়": "y",
  "ৎ": "t",
  "ং": "ng",
  "ঃ": "",
  "ঁ": "",

  // Vowel signs (kar)
  "া": "a",
  "ি": "i",
  "ী": "ee",
  "ু": "u",
  "ূ": "oo",
  "ৃ": "ri",
  "ে": "e",
  "ৈ": "oi",
  "ো": "o",
  "ৌ": "ou",

  // Halant & modifiers
  "্": "",
  "্য": "y",
  "্র": "r",
};

/**
 * Transliterates Bengali text into phonetic Latin characters.
 */
export function transliterateBengali(text: string): string {
  let result = "";
  for (const char of text) {
    if (BANGLA_TO_LATIN_MAP[char] !== undefined) {
      result += BANGLA_TO_LATIN_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Converts any text (English, Bengali, accented characters, etc.)
 * into a URL-friendly slug matching /^[a-z0-9]+(?:-[a-z0-9]+)*$/.
 */
export function slugify(text: string): string {
  if (!text) return "";

  // 1. Transliterate Bengali characters
  let normalized = transliterateBengali(text);

  // 2. Normalize standard Unicode accents (e.g. café -> cafe)
  normalized = normalized.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  // 3. Lowercase & replace non-alphanumeric chars with hyphens
  let slug = normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 4. Fallback if the string had no alphanumeric characters
  if (!slug) {
    slug = "item-" + Date.now().toString(36);
  }

  return slug;
}
