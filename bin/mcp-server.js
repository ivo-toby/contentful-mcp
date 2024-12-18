#!/usr/bin/env node

import { parseArgs } from "node:util";

// Parse command line arguments
const { values } = parseArgs({
  options: {
    "management-token": {
      type: "string",
    },
  },
});

// Set management token if provided via args
if (values["management-token"]) {
  process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN = values["management-token"];
}

// Import and run the bundled server
import "../dist/bundle.js";
