/**
 * Utility functions for the Vibe Soundtrack MCP
 */

// Constants for audio generation
export const MAX_SNIPPET = 1200; // chars
export const DEFAULT_DURATION = 180; // seconds
export const DEFAULT_STEPS = 30; // generation steps
export const DEFAULT_BPM = 120; // default beats per minute
export const DEFAULT_GENRE = "lo-fi house"; // default music genre

// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript:
    /\b(const|let|var|function|=>|async|await|import|export|class)\b|\.(js|jsx|ts|tsx)$/i,
  typescript:
    /\b(interface|type|namespace|enum|as|implements|readonly)\b|\.(ts|tsx)$/i,
  python:
    /\b(def|import|from|class|if __name__ == ['"]__main__['"]|lambda)\b|\.(py)$/i,
  java: /\b(public|private|protected|class|interface|extends|implements|void)\b|\.(java)$/i,
  csharp: /\b(namespace|using|class|void|string\[\]|Console\.Write)\b|\.(cs)$/i,
  ruby: /\b(def|end|module|require|include|attr_accessor)\b|\.(rb)$/i,
  go: /\b(func|package|import|go|chan|struct|interface)\b|\.(go)$/i,
  rust: /\b(fn|let|mut|struct|impl|trait|enum|match|pub)\b|\.(rs)$/i,
  php: /\b(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|function|echo|namespace|use)\b|\.(php)$/i,
  html: /\b(<html|<head|<body|<div|<span|<a|<script|<link|<meta)\b|\.(html|htm)$/i,
  css: /\b(@media|@keyframes|@import|:hover|:root|margin|padding|display|flex)\b|\.(css|scss|sass|less)$/i,
  sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b|\.(sql)$/i,
  shell: /\b(#!\/bin\/|bash|echo|export|source|grep|awk|sed)\b|\.(sh|bash)$/i,
};

// Genre mapping based on language
const LANGUAGE_TO_GENRE: Record<string, string[]> = {
  javascript: ["lo-fi house", "chillhop", "trip hop"],
  typescript: ["synthwave", "ambient techno", "deep house"],
  python: ["ambient", "downtempo", "chillwave"],
  java: ["orchestral", "cinematic", "epic"],
  csharp: ["electronic", "IDM", "glitch"],
  ruby: ["jazz", "bossa nova", "smooth jazz"],
  go: ["minimal techno", "dub techno", "microhouse"],
  rust: ["industrial", "dark ambient", "techno"],
  php: ["vaporwave", "retrowave", "future funk"],
  html: ["pop", "indie pop", "electropop"],
  css: ["dream pop", "shoegaze", "ambient pop"],
  sql: ["acid jazz", "nu jazz", "broken beat"],
  shell: ["breakbeat", "drum and bass", "jungle"],
  unknown: ["lo-fi", "ambient", "electronic"],
};

// Mood mapping based on code characteristics
const CODE_CHARACTERISTICS_TO_MOOD: Record<string, string[]> = {
  complex: ["intense", "focused", "intricate", "mysterious"],
  simple: ["relaxed", "calm", "gentle", "peaceful"],
  dataHeavy: ["structured", "methodical", "precise", "calculated"],
  algorithmic: ["mathematical", "logical", "progressive", "evolving"],
  functional: ["elegant", "flowing", "smooth", "clean"],
  objectOriented: ["layered", "textured", "organized", "detailed"],
  declarative: ["dreamy", "atmospheric", "spacious", "floating"],
  imperative: ["driving", "direct", "forceful", "energetic"],
};

// BPM ranges based on code complexity and style
const COMPLEXITY_TO_BPM = {
  verySimple: [60, 80],
  simple: [80, 100],
  moderate: [100, 120],
  complex: [120, 140],
  veryComplex: [140, 160],
};

/**
 * Detects the programming language from code
 * @param code The code snippet to analyze
 * @returns The detected language or "unknown"
 */
export function detectLanguage(code: string): string {
  for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(code)) {
      return language;
    }
  }
  return "unknown";
}

/**
 * Analyzes code complexity based on various metrics
 * @param code The code snippet to analyze
 * @returns A complexity score from 0 (very simple) to 1 (very complex)
 */
export function analyzeComplexity(code: string): number {
  // This is a simplified complexity analysis
  // In a real implementation, we would use more sophisticated metrics

  // Count nested blocks by tracking braces, indentation, etc.
  const braceNesting = (code.match(/\{/g) || []).length;
  const indentation =
    code.split("\n").reduce((max, line) => {
      const spaces = line.search(/\S|$/);
      return Math.max(max, spaces);
    }, 0) / 8; // Normalize by assuming 8 spaces is deep nesting

  // Count control structures
  const controlStructures = (
    code.match(/\b(if|for|while|switch|catch|try|else|do)\b/g) || []
  ).length;

  // Count function calls and definitions
  const functionCalls = (code.match(/\w+\s*\(/g) || []).length;
  const functionDefs = (
    code.match(/\b(function|def|func|method|class)\b/g) || []
  ).length;

  // Count operators
  const operators = (code.match(/[+\-*/%=&|^<>!?:]+/g) || []).length;

  // Normalize each metric to a 0-1 range and combine with weights
  const normalizedBraceNesting = Math.min(braceNesting / 20, 1);
  const normalizedControlStructures = Math.min(controlStructures / 15, 1);
  const normalizedFunctionCalls = Math.min(functionCalls / 30, 1);
  const normalizedFunctionDefs = Math.min(functionDefs / 10, 1);
  const normalizedOperators = Math.min(operators / 50, 1);

  // Combine metrics with weights
  const complexity =
    normalizedBraceNesting * 0.2 +
    normalizedControlStructures * 0.3 +
    normalizedFunctionCalls * 0.2 +
    normalizedFunctionDefs * 0.2 +
    normalizedOperators * 0.1 +
    indentation * 0.1;

  return Math.min(Math.max(complexity, 0), 1);
}

/**
 * Converts a string to its binary representation.
 * @param str The input string
 * @returns The binary string representation
 */
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");
}

/**
 * Analyzes the binary representation of code for mood characteristics.
 * This is a conceptual example using simple binary analysis.
 * @param code The code snippet to analyze
 * @returns An array of mood descriptors based on binary analysis
 */
export function analyzeCodeBinaryForMood(code: string): string[] {
  const binaryCode = stringToBinary(code);
  const moods: string[] = [];

  if (!binaryCode.length) {
    return moods;
  }

  // 1. Ratio of 0s to 1s
  const ones = (binaryCode.match(/1/g) || []).length;
  const zeros = binaryCode.length - ones;
  const oneRatio = ones / binaryCode.length;

  if (oneRatio > 0.6) {
    moods.push("dense", "intense");
  } else if (oneRatio < 0.4) {
    moods.push("sparse", "minimal");
  } else {
    moods.push("balanced");
  }

  // 2. Frequency of a simple pattern (e.g., '0101')
  const pattern = "0101";
  const patternCount = (binaryCode.match(/0101/g) || []).length;
  // Normalize frequency by potential occurrences
  const patternFrequency = patternCount / (binaryCode.length / pattern.length);

  if (patternFrequency > 0.1) {
    // Arbitrary threshold
    moods.push("rhythmic", "patterned");
  }

  // 3. Simple "Differential Equation" simulation: Rate of change of '1' density
  // We'll check density in chunks and see how much it changes.
  const chunkSize = Math.max(100, Math.floor(binaryCode.length / 10)); // Analyze in chunks
  let maxDensityChange = 0;
  let lastDensity = -1;

  for (let i = 0; i < binaryCode.length; i += chunkSize) {
    const chunk = binaryCode.substring(
      i,
      Math.min(i + chunkSize, binaryCode.length)
    );
    if (chunk.length === 0) continue;
    const chunkOnes = (chunk.match(/1/g) || []).length;
    const currentDensity = chunkOnes / chunk.length;

    if (lastDensity !== -1) {
      maxDensityChange = Math.max(
        maxDensityChange,
        Math.abs(currentDensity - lastDensity)
      );
    }
    lastDensity = currentDensity;
  }

  if (maxDensityChange > 0.3) {
    // Arbitrary threshold for significant change
    moods.push("dynamic", "volatile", "shifting");
  } else if (maxDensityChange < 0.05 && binaryCode.length > chunkSize * 2) {
    // Low change over multiple chunks
    moods.push("stable", "consistent", "steady");
  }

  // Return unique moods derived from binary analysis
  return Array.from(new Set(moods));
}

/**
 * Analyzes code style and paradigm
 * @param code The code snippet to analyze
 * @returns An object with various style characteristics
 */
export function analyzeCodeStyle(code: string): Record<string, number> {
  const result: Record<string, number> = {
    functional: 0,
    objectOriented: 0,
    declarative: 0,
    imperative: 0,
    dataHeavy: 0,
    algorithmic: 0,
  };

  // Functional programming indicators
  const functionalPatterns = [
    /\b(map|filter|reduce|forEach|=>|\.then|\.catch|\.finally)\b/g,
    /\b(const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
    /\b(pure|immutable|curry|compose|pipe|memoize)\b/g,
  ];

  // Object-oriented indicators
  const ooPatterns = [
    /\b(class|extends|implements|interface|new|this|super|constructor|prototype)\b/g,
    /\b(public|private|protected|static|readonly)\b/g,
  ];

  // Declarative indicators
  const declarativePatterns = [
    /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/g,
    /\b(html|jsx|tsx|xml|json|yaml|css)\b/g,
    /[<{][^>}]*[>}]/g,
  ];

  // Imperative indicators
  const imperativePatterns = [
    /\b(for|while|do|if|else|switch|case|break|continue|return|goto)\b/g,
    /\w+\s*=\s*\w+/g,
    /\+\+|--/g,
  ];

  // Data-heavy indicators
  const dataPatterns = [
    /\b(data|database|query|model|schema|entity|table|column|field|record|row)\b/g,
    /\b(Array|List|Map|Set|Dictionary|HashMap|Object|JSON)\b/g,
    /\[\s*\{[^}]*\}\s*\]/g,
  ];

  // Algorithmic indicators
  const algorithmicPatterns = [
    /\b(algorithm|sort|search|traverse|recursive|iteration|complexity|optimize)\b/g,
    /\b(O\([^)]+\))/g,
    /\b(binary|linear|graph|tree|heap|stack|queue)\b/g,
  ];

  // Count matches for each pattern group
  const countMatches = (patterns: RegExp[], code: string) => {
    return patterns.reduce((sum, pattern) => {
      const matches = code.match(pattern) || [];
      return sum + matches.length;
    }, 0);
  };

  // Calculate raw scores
  const functionalScore = countMatches(functionalPatterns, code);
  const ooScore = countMatches(ooPatterns, code);
  const declarativeScore = countMatches(declarativePatterns, code);
  const imperativeScore = countMatches(imperativePatterns, code);
  const dataScore = countMatches(dataPatterns, code);
  const algorithmicScore = countMatches(algorithmicPatterns, code);

  // Normalize scores to 0-1 range
  const total =
    functionalScore +
    ooScore +
    declarativeScore +
    imperativeScore +
    dataScore +
    algorithmicScore;
  if (total > 0) {
    result.functional = functionalScore / total;
    result.objectOriented = ooScore / total;
    result.declarative = declarativeScore / total;
    result.imperative = imperativeScore / total;
    result.dataHeavy = dataScore / total;
    result.algorithmic = algorithmicScore / total;
  }

  return result;
}

/**
 * Analyzes sentiment from code comments and strings
 * @param code The code snippet to analyze
 * @returns A sentiment score from -1 (negative) to 1 (positive)
 */
export function analyzeSentiment(code: string): number {
  // Extract comments and strings
  const commentRegex = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;
  const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g;

  const comments = (code.match(commentRegex) || []).join(" ");
  const strings = (code.match(stringRegex) || []).join(" ");
  const text = comments + " " + strings;

  // Simple sentiment analysis based on keyword matching
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "awesome",
    "nice",
    "best",
    "better",
    "improve",
    "enhancement",
    "feature",
    "success",
    "working",
    "fixed",
    "resolved",
    "solution",
    "optimize",
    "efficient",
    "clean",
    "elegant",
    "simple",
    "clear",
  ];

  const negativeWords = [
    "bad",
    "worst",
    "terrible",
    "awful",
    "poor",
    "bug",
    "error",
    "issue",
    "problem",
    "fail",
    "failure",
    "crash",
    "broken",
    "wrong",
    "fix",
    "hack",
    "workaround",
    "complex",
    "complicated",
    "confusing",
    "messy",
    "slow",
    "inefficient",
  ];

  // Count positive and negative words
  const positiveCount = positiveWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return count + (text.match(regex) || []).length;
  }, 0);

  const negativeCount = negativeWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return count + (text.match(regex) || []).length;
  }, 0);

  // Calculate sentiment score
  if (positiveCount === 0 && negativeCount === 0) {
    return 0; // Neutral if no sentiment words found
  }

  return (positiveCount - negativeCount) / (positiveCount + negativeCount);
}

/**
 * Selects a genre based on code analysis
 * @param code The code snippet to analyze
 * @returns A suitable music genre
 */
export function selectGenre(code: string): string {
  const language = detectLanguage(code);
  const complexity = analyzeComplexity(code);
  const style = analyzeCodeStyle(code);
  const sentiment = analyzeSentiment(code);

  // Get potential genres based on language
  const potentialGenres =
    LANGUAGE_TO_GENRE[language as keyof typeof LANGUAGE_TO_GENRE] ||
    LANGUAGE_TO_GENRE.unknown;

  // Select genre based on dominant code style
  let genreIndex = 0;
  const styleEntries = Object.entries(style);
  if (styleEntries.length > 0) {
    // Sort style characteristics by score (descending)
    styleEntries.sort((a, b) => b[1] - a[1]);
    const dominantStyle = styleEntries[0][0];

    // Use dominant style to influence genre selection
    if (dominantStyle === "functional" || dominantStyle === "declarative") {
      genreIndex = 0; // First genre (usually more ambient/chill)
    } else if (
      dominantStyle === "objectOriented" ||
      dominantStyle === "dataHeavy"
    ) {
      genreIndex = 1; // Second genre (usually more structured)
    } else {
      genreIndex = 2 % potentialGenres.length; // Third genre (usually more energetic)
    }

    // Adjust for sentiment
    if (sentiment > 0.3) {
      // More positive sentiment might shift to a more upbeat genre
      genreIndex = (genreIndex + 1) % potentialGenres.length;
    } else if (sentiment < -0.3) {
      // More negative sentiment might shift to a more atmospheric/dark genre
      genreIndex = Math.max(0, genreIndex - 1);
    }
  }

  return potentialGenres[genreIndex];
}

/**
 * Selects a BPM based on code complexity
 * @param code The code snippet to analyze
 * @returns A suitable BPM value
 */
export function selectBPM(code: string): number {
  const complexity = analyzeComplexity(code);

  // Map complexity to BPM range
  let bpmRange;
  if (complexity < 0.2) {
    bpmRange = COMPLEXITY_TO_BPM.verySimple;
  } else if (complexity < 0.4) {
    bpmRange = COMPLEXITY_TO_BPM.simple;
  } else if (complexity < 0.6) {
    bpmRange = COMPLEXITY_TO_BPM.moderate;
  } else if (complexity < 0.8) {
    bpmRange = COMPLEXITY_TO_BPM.complex;
  } else {
    bpmRange = COMPLEXITY_TO_BPM.veryComplex;
  }

  // Calculate a specific BPM within the range
  const [min, max] = bpmRange;
  const range = max - min;
  const offset = Math.floor(Math.random() * range);
  return min + offset;
}

/**
 * Selects mood descriptors based on code analysis
 * @param code The code snippet to analyze
 * @returns An array of mood descriptors
 */
export function selectMood(code: string): string[] {
  const style = analyzeCodeStyle(code);
  const complexity = analyzeComplexity(code);
  const sentiment = analyzeSentiment(code);
  const binaryMoods = analyzeCodeBinaryForMood(code); // Analyze binary representation

  // Find dominant style characteristics
  const styleEntries = Object.entries(style).sort((a, b) => b[1] - a[1]);
  const dominantStyles = styleEntries.slice(0, 2).map((entry) => entry[0]);

  // Collect potential moods based on dominant styles and binary analysis
  const potentialMoods: string[] = [...binaryMoods]; // Start with moods from binary analysis
  dominantStyles.forEach((style) => {
    if (style in CODE_CHARACTERISTICS_TO_MOOD) {
      potentialMoods.push(
        ...CODE_CHARACTERISTICS_TO_MOOD[
          style as keyof typeof CODE_CHARACTERISTICS_TO_MOOD
        ]
      );
    }
  });

  // Add complexity-based moods
  if (complexity > 0.7) {
    potentialMoods.push(...CODE_CHARACTERISTICS_TO_MOOD.complex);
  } else if (complexity < 0.3) {
    potentialMoods.push(...CODE_CHARACTERISTICS_TO_MOOD.simple);
  }

  // Add sentiment-based moods
  if (sentiment > 0.3) {
    potentialMoods.push("uplifting", "optimistic", "bright", "cheerful");
  } else if (sentiment < -0.3) {
    potentialMoods.push("melancholic", "somber", "tense", "dark");
  } else {
    potentialMoods.push("balanced", "contemplative", "neutral");
  }

  // Ensure we have moods to choose from
  if (potentialMoods.length === 0) {
    return ["atmospheric", "electronic"];
  }

  // Select 2-3 unique moods
  const uniqueMoods = Array.from(new Set(potentialMoods));
  const numMoods = Math.min(
    uniqueMoods.length,
    2 + Math.floor(Math.random() * 2)
  );

  // Shuffle and take the first few
  return uniqueMoods.sort(() => Math.random() - 0.5).slice(0, numMoods);
}

export function suggestInstrumentation(code: string): string[] {
  // ---------- 1. quick metrics ----------
  const lines = code.split(/\r?\n/);
  const loc = lines.length;

  let commentChars = 0,
    branchPoints = 0,
    indentSum = 0;
  const fnNames = new Set<string>();

  const commentRE = /^\s*(\/\/|#|\/\*|\*)/;
  const branchRE =
    /\b(if|for|while|case|catch|else\s+if|switch|\?\s*|&&|\|\|)\b/;

  for (const ln of lines) {
    if (commentRE.test(ln)) commentChars += ln.length;
    if (branchRE.test(ln)) branchPoints += (ln.match(branchRE) || []).length;

    // crude indent depth (spaces only, tabs count as 4)
    const matchResult = ln.match(/^\s*/);
    const indent = matchResult
      ? matchResult[0].replace(/\t/g, "    ").length
      : 0;
    indentSum += indent;

    // capture function names for recursion detection
    const fn = ln.match(
      /\bfunction\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/
    );
    if (fn) fnNames.add(fn[1] || fn[2]);
  }

  const avgIndent = indentSum / loc || 0;
  const commentsRatio = commentChars / (code.length || 1);

  // recursion flag
  let hasRecursion = false;
  for (const name of fnNames) {
    const calls = new RegExp(`\\b${name}\\s*\\(`);
    const defLine = new RegExp(`function\\s+${name}\\b|const\\s+${name}\\b`);
    let seenDef = false;
    for (const ln of lines) {
      if (!seenDef && defLine.test(ln)) {
        seenDef = true;
        continue;
      }
      if (seenDef && calls.test(ln)) {
        hasRecursion = true;
        break;
      }
    }
    if (hasRecursion) break;
  }

  // keyword presence
  const up = code.toUpperCase();
  const hasSQL = /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/.test(up);
  const hasAsync = /\basync\b|\bawait\b|\bPromise\b/.test(code);

  // crude cyclomatic ≈ branches + function count
  const cyclomatic = branchPoints + fnNames.size;

  // ---------- 2. map to instrumentation ----------
  const instruments = new Set<string>();

  // baseline drum track
  instruments.add("acoustic kick & snare");

  // SQL → lo-fi palette
  if (hasSQL) {
    instruments.add("lo-fi drum loop");
    instruments.add("dusty vinyl crackle");
    instruments.add("electric rhodes piano");
  }

  // async / concurrency → house-ish syncopation
  if (hasAsync) {
    instruments.add("four-on-the-floor house kit");
    instruments.add("side-chained saw pad");
    instruments.add("percussive hi-hat shuffle");
  }

  // recursion → arpeggiator
  if (hasRecursion) instruments.add("arpeggiated bell synth");

  // density from cyclomatic complexity
  if (cyclomatic > 15) instruments.add("poly synth chords");
  if (cyclomatic > 25) instruments.add("counter-melody pluck");

  // comment-heavy → vocal presence
  if (commentsRatio > 0.3) instruments.add("soft lead vocal ooohs");

  // deep indentation → jazz chords
  if (avgIndent > 8) instruments.add("extended jazz piano");

  // LOC-based ornamentation
  if (loc < 40) instruments.add("minimal sub-bass");
  else if (loc > 200) instruments.add("warm string pad");

  return Array.from(instruments);
}

/**
 * Builds a prompt for audio generation based on code context
 * @param code The code snippet to generate music for
 * @param genre Optional override for the music genre
 * @returns A formatted prompt for audio generation
 */
export function buildPrompt(code: string, genre?: string): string {
  const trimmedCode = code.slice(0, MAX_SNIPPET);

  // Analyze code to determine musical characteristics
  const detectedGenre = selectGenre(trimmedCode);
  const finalGenre = genre || detectedGenre;
  const bpm = selectBPM(trimmedCode);
  const mood = selectMood(trimmedCode).join(", ");
  const language = detectLanguage(trimmedCode);
  const complexity = analyzeComplexity(trimmedCode);
  const sentiment = analyzeSentiment(trimmedCode); // Get sentiment score
  const instrumentation = suggestInstrumentation(trimmedCode);

  // Describe sentiment
  let sentimentDescription = "neutral";
  if (sentiment > 0.3) {
    sentimentDescription = "positive";
  } else if (sentiment < -0.3) {
    sentimentDescription = "negative";
  }

  // Build a more detailed prompt
  return `Genre: ${finalGenre}
Mood: ${mood}
Tempo: ${bpm} BPM
Style: ${complexity > 0.6 ? "complex and intricate" : "smooth and flowing"}
Sentiment: ${sentimentDescription}
Inspiration: ${language} code that is ${
    complexity > 0.5 ? "sophisticated and detailed" : "clean and elegant"
  }
Instrumentation: ${instrumentation.join(", ")}
The music should capture the essence of coding in ${language}, with a ${mood} atmosphere.
CODE CONTEXT:
${trimmedCode}`;
}
