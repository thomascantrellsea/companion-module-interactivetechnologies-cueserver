module.exports = {
        clearMocks: true,
        collectCoverageFrom: ['src/**/*.js', 'index.js'],
        coverageDirectory: 'coverage',
        moduleFileExtensions: ['js', 'json'],
        testEnvironment: 'node',
        testMatch: ['**/__tests__/**/*.test.js'],
};
