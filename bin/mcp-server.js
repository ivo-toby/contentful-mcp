#!/usr/bin/env node

// Pass through all command line arguments to the bundled server
process.argv.splice(1, 1);
import "../dist/bundle.js";
