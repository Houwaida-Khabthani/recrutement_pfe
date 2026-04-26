const axios = require('axios');
const FormData = require('form-data');

const cleanText = (input = '') =>
  input
    .replace(/\u200B/g, ' ')
    .replace(/â€‹/g, ' ')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“/g, '-')
    .replace(/Ã©/g, 'e')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeForSearch = (input = '') =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const scoreNameCandidate = (line = '') => {
  if (!line) return 0;
  const cleaned = line.trim();
  if (cleaned.length < 4 || cleaned.length > 40) return -2;
  if (/@|http|www|\d/.test(cleaned)) return -2;
  if (/curriculum|resume|cv|experience|expérience|education|formation|skills|competences|compétences|profile|summary|objectif/i.test(cleaned)) return -1;
  if (cleaned.split(/\s+/).length < 2 || cleaned.split(/\s+/).length > 4) return -1;
  if (/^[A-Z][A-Za-zÀ-ÿ'`-]+(?:\s+[A-Z][A-Za-zÀ-ÿ'`-]+){1,3}$/.test(cleaned)) return 3;
  if (/^[A-Za-zÀ-ÿ'`-]+(?:\s+[A-Za-zÀ-ÿ'`-]+){1,3}$/.test(cleaned)) return 1;
  return 0;
};

const extractContactInfo = (text = '') => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)]+/i);
  return {
    email: emailMatch?.[0] || 'Not found',
    phone: phoneMatch?.[0] || 'Not found',
    linkedin: linkedinMatch?.[0] || 'Not found',
    github: githubMatch?.[0] || 'Not found',
  };
};

// Helper function to extract richer info from CV sections
const extractBasicInfo = (sections, text) => {
  const info = {
    name: 'Not found',
    email: 'Not found',
    skills: [],
    experience: 'Not found',
    phone: 'Not found',
    linkedin: 'Not found',
    github: 'Not found',
    years_of_experience: 'Not found',
  };

  const mergedText = cleanText(`${sections.contact || ''}\n${sections.summary || ''}\n${text || ''}`);
  const firstChunkLines = mergedText
    .split('\n')
    .map((l) => cleanText(l))
    .filter(Boolean)
    .slice(0, 30);

  // Contact extraction from full text, not only contact section
  const contacts = extractContactInfo(mergedText);
  info.email = contacts.email;
  info.phone = contacts.phone;
  info.linkedin = contacts.linkedin;
  info.github = contacts.github;

  // Name extraction: pick best-scored candidate in first lines
  let bestName = '';
  let bestScore = -99;
  for (const line of firstChunkLines) {
    const score = scoreNameCandidate(line);
    if (score > bestScore) {
      bestScore = score;
      bestName = line;
    }
  }
  if (bestScore >= 0) {
    info.name = bestName;
  }

  const skillsText = normalizeForSearch(`${sections.skills || ''} ${mergedText.substring(0, 4000)}`);

  const commonSkills = [
    'python', 'java', 'javascript', 'typescript', 'sql', 'aws', 'docker', 'kubernetes',
    'react', 'node.js', 'html', 'css', 'git', 'php', 'c++', 'c#',
    'mongodb', 'mysql', 'postgresql', 'linux', 'django', 'flask', 'spring', 'angular', 'vue',
    'machine learning', 'data science', 'artificial intelligence', 'deep learning',
    'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'power bi', 'tableau',
    'communication', 'leadership', 'problem solving', 'gestion de projet', 'agile', 'scrum',
    'developpement web', 'developpement', 'programmation', 'base de donnees',
    'analyse de donnees', 'intelligence artificielle', 'apprentissage automatique'
  ];

  info.skills = commonSkills.filter((skill) => skillsText.includes(normalizeForSearch(skill))).slice(0, 20);

  // Experience summary
  if (sections.experience) {
    const expLines = cleanText(sections.experience).split('.').slice(0, 3).join('. ').trim();
    info.experience = expLines.length > 280 ? `${expLines.slice(0, 277)}...` : expLines;
  } else {
    const expMatches = mergedText.match(/(?:experience|expérience|worked|travaillé|developer|developpeur|engineer|ingenieur)/i);
    if (expMatches) {
      const start = normalizeForSearch(mergedText).indexOf(normalizeForSearch(expMatches[0]));
      const excerpt = cleanText(mergedText.substring(Math.max(0, start - 40), start + 350));
      info.experience = excerpt.length > 280 ? `${excerpt.substring(0, 277)}...` : excerpt;
    }
  }

  // Years of experience estimate
  const yearsMatch = mergedText.match(/(\d{1,2})\+?\s*(?:years|ans|year|an)/i);
  if (yearsMatch) {
    info.years_of_experience = `${yearsMatch[1]} years`;
  }

  return info;
};

const buildExtraSuggestions = (sections, info) => {
  const tips = [];
  if (info.email === 'Not found') tips.push('Add a professional email address in your contact section.');
  if (info.phone === 'Not found') tips.push('Add a phone number so recruiters can contact you quickly.');
  if (info.linkedin === 'Not found') tips.push('Add your LinkedIn profile URL to improve recruiter trust.');
  if (info.github === 'Not found') tips.push('For technical roles, include a GitHub or portfolio link.');
  if (!sections.skills) tips.push('Create a dedicated Skills section with tools, frameworks, and languages.');
  if (!sections.experience) tips.push('Add a clear Experience section with achievements and measurable impact.');
  if (!sections.education) tips.push('Add your education details (degree, school, and graduation year).');
  return tips;
};

const parseCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No CV uploaded" });
    }

    // Create form data to send to Python server
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Proxy to Python AI server
    const response = await axios.post('http://localhost:8000/analyze-cv', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Get data from Python server
    const data = response.data;
    const sections = data.sections || {};
    const extractedText = cleanText(data.extracted_text || '');

    // Extract basic info from sections
    const basicInfo = extractBasicInfo(sections, extractedText);
    const extraSuggestions = buildExtraSuggestions(sections, basicInfo);

    // Transform the response to match frontend expectations
    const transformed = {
      score: data.overall_score,
      suggestions: [...(data.improvement_tips || []).map((tip) => tip.tip).filter(Boolean), ...extraSuggestions],
      ats_compatibility: data.ats_compatibility,
      pro_tips: data.pro_tips,
      name: basicInfo.name,
      email: basicInfo.email,
      skills: basicInfo.skills,
      experience: basicInfo.experience,
      phone: basicInfo.phone,
      linkedin: basicInfo.linkedin,
      github: basicInfo.github,
      years_of_experience: basicInfo.years_of_experience,
      sections_found: Object.keys(sections || {}),
    };

    res.json(transformed);

  } catch (error) {
    const status = error.response?.status || error.status || 500;
    const message = error.response?.data?.detail || error.response?.data?.message || error.message || "CV analysis failed";
    console.error('Error calling Python AI server:', status, message);
    res.status(status).json({ message });
  }
};

module.exports = { parseCV };