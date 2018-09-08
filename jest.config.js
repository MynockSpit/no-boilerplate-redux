module.exports = {
  testURL: "http://localhost/",
  transformIgnorePatterns: [
    "/!node_modules\\/lodash/"
  ],
  // verbose: true,
  collectCoverage: true,
  coverageReporters: ["cobertura", "json", "lcov", "text"]
}