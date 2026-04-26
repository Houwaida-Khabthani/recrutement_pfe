const skillExtractor = require("./skill.extractor");

exports.calculateMatchScore = (candidateSkills, jobRequirements) => {
  if (!candidateSkills.length || !jobRequirements.length) return 0;

  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  const jobSet = new Set(jobRequirements.map(s => s.toLowerCase()));

  let intersection = 0;
  jobSet.forEach(skill => {
    if (candidateSet.has(skill)) intersection++;
  });

  // Calculate percentage based on job requirements met
  return Math.round((intersection / jobSet.size) * 100);
};

exports.compareTexts = (candidateBio, jobDescription) => {
  const candidateSkills = skillExtractor.extractSkills(candidateBio);
  const jobSkills = skillExtractor.extractSkills(jobDescription);
  return this.calculateMatchScore(candidateSkills, jobSkills);
};