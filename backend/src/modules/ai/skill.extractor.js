const commonSkills = [
  "javascript", "python", "java", "php", "cpp", "csharp", "react", "angular", "vue",
  "node", "express", "django", "laravel", "mysql", "mongodb", "postgresql", "docker",
  "kubernetes", "aws", "azure", "html", "css", "typescript", "git", "scrum", "agile",
  "ai", "ml", "devops", "design", "ui", "ux", "marketing", "sales", "management"
];

exports.extractSkills = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  return commonSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    return regex.test(lowerText);
  });
};