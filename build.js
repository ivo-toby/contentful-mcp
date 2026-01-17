import * as esbuild from "esbuild";

// SlowBuffer polyfill - buffer-equal-constant-time (dependency of jsonwebtoken
// used by @contentful/node-apps-toolkit) accesses SlowBuffer.prototype which was
// removed from Node.js. This polyfill must run before any require() calls.
const slowBufferPolyfill = `
import { Buffer as _Buffer } from 'buffer';
import _bufferModule from 'buffer';
if (!_bufferModule.SlowBuffer) { _bufferModule.SlowBuffer = _Buffer; }
`;

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "./dist/bundle.js",
  target: "node18",
  banner: {
    js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);${slowBufferPolyfill}`,
  },
});
