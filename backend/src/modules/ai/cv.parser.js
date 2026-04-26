const pdfParse = require("pdf-parse");

const extractSection = (text, keywords) => {
  const lines = text.split("\n");

  let capture = false;
  let result = [];

  for (let line of lines) {
    const lower = line.toLowerCase();

    if (keywords.some(k => lower.includes(k))) {
      capture = true;
      continue;
    }

    if (capture) {
      // stop when new section starts
      if (
        lower.includes("experience") ||
        lower.includes("education") ||
        lower.includes("projet") ||
        lower.includes("langue") ||
        lower.includes("certif") ||
        lower.includes("skill")
      ) {
        break;
      }

      if (line.trim()) {
        result.push(line.trim());
      }
    }
  }

  return result.join("\n");
};

const parseCV = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer);
  const text = data.text;

  return {
    experience: extractSection(text, ["experience", "expérience"]),
    niveau_etude: extractSection(text, ["education", "formation", "étude"]),
    projets: extractSection(text, ["project", "projet"]),
    langues: extractSection(text, ["langue", "language"]),
    certification: extractSection(text, ["certification", "certificat"]),
    competences: extractSection(text, ["skills", "compétences"]),
  };
};

module.exports = parseCV;