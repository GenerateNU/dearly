module.exports = {
  "backend/**/*.ts": [
    "prettier --write",
    "cd backend && eslint --fix",
  ],
  "frontend/**/*.{ts,tsx}": ["prettier --write", "cd frontend && eslint --fix"],
};
