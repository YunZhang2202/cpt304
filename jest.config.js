module.exports = {
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        url: "http://localhost/",
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "*.js",
        "!jest.config.js",
        "!node_modules/**",
        "!coverage/**",
    ],
};