/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS, SsmLanguageService } from "../ssmLanguageService";
import { IConnection } from "vscode-languageserver";
import { LanguageModelCache } from "./languageModelCache";
import { formatError } from "./runner";

export class DelayedValidationService {
    private readonly pendingValidationRequests: { [uri: string]: NodeJS.Timer } = {};
    private readonly validationDelayMs = 500;

    constructor(
        private readonly languageService: SsmLanguageService,
        private readonly jsonModelsCache: LanguageModelCache<JsonLS.JSONDocument>,
        private readonly connection: IConnection
    ) {}

    public cleanPendingValidation(textDocument: JsonLS.TextDocument): void {
        const request = this.pendingValidationRequests[textDocument.uri];
        if (request) {
            clearTimeout(request);
            // tslint:disable-next-line: no-dynamic-delete
            delete this.pendingValidationRequests[textDocument.uri];
        }
    }

    public triggerValidation(textDocument: JsonLS.TextDocument): void {
        this.cleanPendingValidation(textDocument);
        this.pendingValidationRequests[textDocument.uri] = setTimeout(() => {
            // tslint:disable-next-line: no-dynamic-delete
            delete this.pendingValidationRequests[textDocument.uri];
            this.validateTextDocument(textDocument);
        }, this.validationDelayMs);
    }

    public async validateTextDocument(textDocument: JsonLS.TextDocument): Promise<JsonLS.Diagnostic[]> {
        try {
            const documentSettings: JsonLS.DocumentLanguageSettings = { comments: "error", trailingCommas: "error" };
            const jsonDocument = this.jsonModelsCache.get(textDocument);
            const diagnostics = await this.languageService.doValidation(textDocument, jsonDocument, documentSettings);
            this.connection.sendDiagnostics({
                uri: textDocument.uri,
                diagnostics,
            });
            return diagnostics;
        } catch (e) {
            this.connection.console.error(formatError(`Error while validating ${textDocument.uri}`, e));
            throw e;
        }
    }
}
