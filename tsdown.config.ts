/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { defineConfig } from "tsdown";

const OUT_DIR = "./dist";
const ADOBE_LICENSE_BANNER = `
/**
 * @license
 * 
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
`.trimStart();

export default defineConfig({
  entry: [
    "./source/index.ts",
    "./source/otel.ts",
    "./source/integrations/index.ts",
  ],

  format: {
    cjs: {
      outputOptions: {
        dir: `${OUT_DIR}/cjs`,
      },
    },
    esm: {
      outputOptions: {
        dir: `${OUT_DIR}/es`,
      },
    },
  },

  publint: true,
  outputOptions: {
    legalComments: "inline",
    dir: OUT_DIR,

    minifyInternalExports: true,
  },

  dts: true,
  treeshake: true,
  minify: {
    compress: true,
  },

  nodeProtocol: "strip",
  banner: {
    js: ADOBE_LICENSE_BANNER,
    dts: ADOBE_LICENSE_BANNER,
  },
});
