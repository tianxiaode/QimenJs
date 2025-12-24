'use strict';

const BuildTool = require('./build-tool');

const buildTool = new BuildTool('./build-config.json');
const moduleConfig = buildTool.config.modules.find(m => m.name === 'core');

if (moduleConfig) {
  buildTool.buildModule(moduleConfig);
} else {
  console.error('❌ Core module configuration not found');
  process.exit(1);
}