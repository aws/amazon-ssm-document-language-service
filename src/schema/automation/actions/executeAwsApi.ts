/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";

export const executeAwsApiInputs: JsonLS.JSONSchema = {
    description:
        "Calls and runs AWS API actions. Most API actions are supported, although not all API actions have been tested.",
    properties: {
        inputs: {
            properties: {
                Service: {
                    description: "The AWS service namespace that contains the API action that you want to run.",
                    type: "string",
                },
                Api: {
                    description: "The name of the API action that you want to run.",
                    type: "string",
                },
            },
            additionalProperties: true,
            required: ["Service"],
        },
    },
};
