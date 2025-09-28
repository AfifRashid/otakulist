module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '.', outputName: 'junit-report.xml' }]
  ]
};
