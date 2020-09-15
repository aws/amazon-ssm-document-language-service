/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../../ssmLanguageService";
import { approveInputs } from "./actions/approve";
import { assertAwsResourcePropertyInputs } from "./actions/assertAwsResourceProperty";
import { branchInputs } from "./actions/branch";
import { changeInstanceStateInputs } from "./actions/changeInstanceState";
import { copyImageInputs } from "./actions/copyImage";
import { createImageInputs, createImageSnippet } from "./actions/createImage";
import { createStackInputs } from "./actions/createStack";
import { createTagsInputs } from "./actions/createTags";
import { deleteImageInputs } from "./actions/deleteImage";
import { deleteStackInputs } from "./actions/deleteStack";
import { executeAutomationInputs } from "./actions/executeAutomation";
import { executeAwsApiInputs } from "./actions/executeAwsApi";
import { executeScriptInputs } from "./actions/executeScript";
import { executeStateMachineInputs } from "./actions/executeStateMachine";
import { invokeLambdaFunctionInputs } from "./actions/invokeLambdaFunction";
import { pauseInputs } from "./actions/pause";
import { runCommandInputs } from "./actions/runCommand";
import { runInstancesInputs, runInstancesSnippet } from "./actions/runInstances";
import { sleepInputs } from "./actions/sleep";
import { waitForAwsResourcePropertyInputs } from "./actions/waitForAwsResourceProperty";

export const stepDefinition: JsonLS.JSONSchema = {
    type: "object",
    required: ["name", "action", "inputs"],
    properties: {
        name: {
            type: "string",
        },
        action: {
            type: "string",
            enum: ["aws:approve", "aws:runInstances", "aws:executeScript"],
        },
        maxAttempts: {},
        onFailure: {},
        nextStep: {},
        isEnd: {},
        isCritical: {},
        inputs: {},
        outputs: {},
    },
    allOf: [
        {
            if: {
                properties: { action: { const: "aws:approve" } },
            },
            then: approveInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:assertAwsResourceProperty" } },
            },
            then: assertAwsResourcePropertyInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:branch" } },
            },
            then: branchInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:changeInstanceState" } },
            },
            then: changeInstanceStateInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:copyImage" } },
            },
            then: copyImageInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:createImage" } },
            },
            then: createImageInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:createStack" } },
            },
            then: createStackInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:createTags" } },
            },
            then: createTagsInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:deleteImage" } },
            },
            then: deleteImageInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:deleteStack" } },
            },
            then: deleteStackInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:executeAutomation" } },
            },
            then: executeAutomationInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:executeAwsApi" } },
            },
            then: executeAwsApiInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:executeScript" } },
            },
            then: executeScriptInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:executeStateMachine" } },
            },
            then: executeStateMachineInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:invokeLambdaFunction" } },
            },
            then: invokeLambdaFunctionInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:pause" } },
            },
            then: pauseInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:runCommand" } },
            },
            then: runCommandInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:runInstances" } },
            },
            then: runInstancesInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:sleep" } },
            },
            then: sleepInputs,
        },
        {
            if: {
                properties: { action: { const: "aws:waitForAwsResourceProperties" } },
            },
            then: waitForAwsResourcePropertyInputs,
        },
    ],
    defaultSnippets: [createImageSnippet, runInstancesSnippet],
};
