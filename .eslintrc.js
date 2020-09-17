/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
"use strict";

/**@type {import('eslint').Linter.Config}*/
const config = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
    },
    env: {
        es6: true,
        node: true,
    },
    plugins: ["@typescript-eslint", "header", "prettier"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    rules: {
        "prettier/prettier": "error",
        "header/header": [
            "error",
            "block",
            {
                pattern:
                    "Copyright ([0-9]{4}[-,]{0,1}[ ]{0,1}){1,} Amazon.com, Inc. or its affiliates. All Rights Reserved.\\r?\\n \\* SPDX-License-Identifier: Apache-2.0",
            },
            { lineEndings: "unix" },
        ],
    },
};
module.exports = config;
