'use strict';

const BuildTool = require('./build-tool');

const buildTool = new BuildTool('./build-config.json');
const moduleConfig = buildTool.config.modules.find(m => m.name === 'validation');

if (moduleConfig) {
  buildTool.buildModule(moduleConfig);
} else {
  console.error('❌ Validation module configuration not found');
  process.exit(1);
}