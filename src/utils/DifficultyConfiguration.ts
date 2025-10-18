// Easy (Beginner)
export const easyConfig = {
  searchDepth: 2,
  evaluationWeights: {
    goalDistance: 80,
    nearGoalBonus: 150,
    mobility: 5,
    centerControl: 3,
    forwardProgress: 10,
  }
};

// Medium (Intermediate)
export const mediumConfig = {
  searchDepth: 3,
  evaluationWeights: {
    goalDistance: 100,
    nearGoalBonus: 200,
    mobility: 8,
    centerControl: 4,
    forwardProgress: 12,
  }
};

// Hard (Advanced) - DEFAULT
export const hardConfig = {
  searchDepth: 4,
  evaluationWeights: {
    goalDistance: 100,
    nearGoalBonus: 200,
    mobility: 10,
    centerControl: 5,
    forwardProgress: 15,
  }
};

// Expert (Master)
export const expertConfig = {
  searchDepth: 5,
  evaluationWeights: {
    goalDistance: 120,
    nearGoalBonus: 250,
    mobility: 12,
    centerControl: 6,
    forwardProgress: 18,
  }
};
