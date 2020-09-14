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
    plugins: ["@typescript-eslint", "prettier"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    rules: {
        "prettier/prettier": "error",
    },
};
module.exports = config;
