/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../ssmLanguageService";
import * as YAML from "yaml";
import { SnippetDefinition } from "../schema/interfaces";
import { executeScriptPowershellSnippet, executeScriptPythonSnippet } from "../schema/automation/actions/executeScript";
import { approveSnippet } from "../schema/automation/actions/approve";
import { assertAwsResourcePropertySnippet } from "../schema/automation/actions/assertAwsResourceProperty";
import { branchSnippet } from "../schema/automation/actions/branch";
import { changeInstanceStateSnippet } from "../schema/automation/actions/changeInstanceState";
import { copyImageSnippet } from "../schema/automation/actions/copyImage";
import { createImageSnippet } from "../schema/automation/actions/createImage";
import { createStackSnippet } from "../schema/automation/actions/createStack";
import { executeAutomationSnippet } from "../schema/automation/actions/executeAutomation";
import { executeAwsApiSnippet } from "../schema/automation/actions/executeAwsApi";
import { invokeLambdaFunctionSnippet } from "../schema/automation/actions/invokeLambdaFunction";
import { pauseSnippet } from "../schema/automation/actions/pause";
import { runCommandSnippet } from "../schema/automation/actions/runCommand";
import { runInstancesSnippet } from "../schema/automation/actions/runInstances";
import { sleepSnippet } from "../schema/automation/actions/sleep";
import { createTagsSnippet } from "../schema/automation/actions/createTags";
import { deleteImageSnippet } from "../schema/automation/actions/deleteImage";
import { waitForAwsResourcePropertySnippet } from "../schema/automation/actions/waitForAwsResourceProperty";
import { deleteStackSnippet } from "../schema/automation/actions/deleteStack";
import { executeStateMachineSnippet } from "../schema/automation/actions/executeStateMachine";

const snippets: SnippetDefinition[] = [
    approveSnippet,
    assertAwsResourcePropertySnippet,
    branchSnippet,
    changeInstanceStateSnippet,
    copyImageSnippet,
    createImageSnippet,
    createStackSnippet,
    createTagsSnippet,
    deleteImageSnippet,
    deleteStackSnippet,
    executeAutomationSnippet,
    executeAwsApiSnippet,
    executeScriptPowershellSnippet,
    executeScriptPythonSnippet,
    executeStateMachineSnippet,
    invokeLambdaFunctionSnippet,
    pauseSnippet,
    runCommandSnippet,
    runInstancesSnippet,
    sleepSnippet,
    waitForAwsResourcePropertySnippet,
];

export function fixYamlCompletionList(
    completionItemList: JsonLS.CompletionItem[],
    finYamlIndentationFlag: boolean
): void {
    for (const completionItem of completionItemList) {
        fixYamlSnippetCompletionItem(completionItem, finYamlIndentationFlag);
    }
}

function fixYamlSnippetCompletionItem(completionItem: JsonLS.CompletionItem, finYamlIndentationFlag: boolean): void {
    if (completionItem.kind !== 9 || !completionItem.label.startsWith("Snippet:")) {
        return;
    }
    for (const snippet of snippets) {
        if (snippet.label === completionItem.label) {
            // tries to fix an issue in yaml-language-service YAML stringify for defaultSnippets
            // the issue is with stringify-ing 'multiline strings' and 'arrays of string elements'
            const yamlContent = YAML.stringify(snippet.body, {
                indent: 4,
            });
            completionItem.insertText = yamlContent;
            if (completionItem.textEdit?.newText) {
                completionItem.textEdit.newText = yamlContent;
            }
            break;
        }
    }
    if (finYamlIndentationFlag) {
        fixYamlArrayItemIndentation(completionItem);
    }
}

function fixYamlArrayItemIndentation(item: JsonLS.CompletionItem): void {
    if (item.insertText) {
        item.insertText = fixIndentation(item.insertText);
    }
    if (item.textEdit?.newText) {
        item.textEdit.newText = fixIndentation(item.textEdit.newText);
    }
}

function fixIndentation(text: string): string {
    // tries to fix an issue when yaml-language-service isn't indentating subsequent lines when inserting an array item.
    return text
        ?.split("\n")
        .map((line, idx) => {
            if (idx > 0) {
                return "  " + line;
            }
            return line;
        })
        .join("\n");
}
