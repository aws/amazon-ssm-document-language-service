/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../../ssmLanguageService";

export const pauseInputs: JsonLS.JSONSchema = {
    description:
        "This action pauses the Automation execution. Once paused, the execution status is Waiting. To continue the Automation execution, use the SendAutomationSignal API action with the Resume signal type.",
};

export const pauseSnippet: SnippetDefinition = {
    label: "aws:pause",
    description: "aws:pause action snippet",
    body: {
        name: "pause",
        action: "aws:pause",
        inputs: {},
    },
};
