/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as JsonLS from "vscode-json-languageservice";
import * as YamlLS from "yaml-language-server";
import { parse as parseYaml } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser07";
import { ssmDocumentSchema } from "./schema/ssmDocumentSchema";

export { JsonLS };

export interface SsmLanguageSettings extends JsonLS.LanguageSettings {
    hover?: boolean;
    completion?: boolean;
}

export interface SsmLanguageService {
    configure(settings: SsmLanguageSettings): void;
    doValidation(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        documentSettings?: JsonLS.DocumentLanguageSettings,
        schema?: JsonLS.JSONSchema
    ): Promise<JsonLS.Diagnostic[]>;
    doComplete(
        document: JsonLS.TextDocument,
        position: JsonLS.Position,
        jsonDocument: JsonLS.JSONDocument
    ): Promise<JsonLS.CompletionList | null>;
    doResolve(item: JsonLS.CompletionItem): Promise<JsonLS.CompletionItem>;
    doHover(
        document: JsonLS.TextDocument,
        position: JsonLS.Position,
        jsonDocument: JsonLS.JSONDocument
    ): Promise<JsonLS.Hover | null>;
    findDocumentSymbols(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        context?: JsonLS.DocumentSymbolsContext
    ): JsonLS.SymbolInformation[];
    findDocumentSymbols2(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        context?: JsonLS.DocumentSymbolsContext
    ): JsonLS.DocumentSymbol[];
    format(document: JsonLS.TextDocument, range: JsonLS.Range, options: JsonLS.FormattingOptions): JsonLS.TextEdit[];
    findDocumentColors(
        document: JsonLS.TextDocument,
        doc: JsonLS.JSONDocument,
        context?: JsonLS.ColorInformationContext
    ): Promise<JsonLS.ColorInformation[]>;
    getColorPresentations(
        document: JsonLS.TextDocument,
        doc: JsonLS.JSONDocument,
        color: JsonLS.Color,
        range: JsonLS.Range
    ): JsonLS.ColorPresentation[];
    getFoldingRanges(document: JsonLS.TextDocument, context?: JsonLS.FoldingRangesContext): JsonLS.FoldingRange[];
    getSelectionRanges(
        document: JsonLS.TextDocument,
        positions: JsonLS.Position[],
        doc: JsonLS.JSONDocument
    ): JsonLS.SelectionRange[];
    resetSchema(uri: string): boolean;
    parseJSONDocument(document: JsonLS.TextDocument): JsonLS.JSONDocument;
}

class SsmLanguageServiceImpl implements SsmLanguageService {
    constructor(
        private jsonLanguageService: JsonLS.LanguageService,
        private yamlLanguageService: YamlLS.LanguageService
    ) {}

    configure(settings: SsmLanguageSettings): void {
        this.jsonLanguageService.configure({
            validate: settings.validate,
            allowComments: settings.allowComments,
            schemas: settings.schemas,
        });
        this.yamlLanguageService.configure({
            validate: settings.validate,
            hover: settings.hover,
            completion: settings.completion,
            schemas: settings.schemas,
        });
    }

    async doValidation(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        documentSettings?: JsonLS.DocumentLanguageSettings | undefined,
        schema?: JsonLS.JSONSchema | undefined
    ): Promise<JsonLS.Diagnostic[]> {
        const diagnostics =
            document.languageId === "ssm-json"
                ? await this.jsonLanguageService.doValidation(document, jsonDocument, documentSettings, schema)
                : await this.yamlLanguageService.doValidation(document, false);
        // vscode-json-languageservice and yaml-language-server will always set severity as warning for JSONSchema validation
        // there is no option to configure this behavior so severity needs to be overwritten as error
        return diagnostics.map((diagnostic) => {
            diagnostic.severity = JsonLS.DiagnosticSeverity.Error;
            return diagnostic;
        });
    }

    async doComplete(
        document: JsonLS.TextDocument,
        position: JsonLS.Position,
        jsonDocument: JsonLS.JSONDocument
    ): Promise<JsonLS.CompletionList | null> {
        if (document.languageId === "ssm-json") {
            return await this.jsonLanguageService.doComplete(document, position, jsonDocument);
        } else {
            return await this.yamlLanguageService.doComplete(document, position, false);
        }
    }

    async doResolve(item: JsonLS.CompletionItem): Promise<JsonLS.CompletionItem> {
        const jsonResult = await this.jsonLanguageService.doResolve(item);
        if (!jsonResult.label && jsonResult !== item) {
            return jsonResult;
        }

        const yamlResult = await this.yamlLanguageService.doResolve(item);

        return yamlResult;
    }

    async doHover(
        document: JsonLS.TextDocument,
        position: JsonLS.Position,
        jsonDocument: JsonLS.JSONDocument
    ): Promise<JsonLS.Hover | null> {
        if (document.languageId === "ssm-json") {
            return await this.jsonLanguageService.doHover(document, position, jsonDocument);
        } else {
            return await this.yamlLanguageService.doHover(document, position);
        }
    }

    findDocumentSymbols(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        context?: JsonLS.DocumentSymbolsContext | undefined
    ): JsonLS.SymbolInformation[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.findDocumentSymbols(document, jsonDocument, context);
        } else {
            return this.yamlLanguageService.findDocumentSymbols(document);
        }
    }

    findDocumentSymbols2(
        document: JsonLS.TextDocument,
        jsonDocument: JsonLS.JSONDocument,
        context?: JsonLS.DocumentSymbolsContext | undefined
    ): JsonLS.DocumentSymbol[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.findDocumentSymbols2(document, jsonDocument, context);
        } else {
            return this.yamlLanguageService.findDocumentSymbols2(document);
        }
    }

    format(document: JsonLS.TextDocument, range: JsonLS.Range, options: JsonLS.FormattingOptions): JsonLS.TextEdit[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.format(document, range, options);
        } else {
            return this.yamlLanguageService.doFormat(document, {});
        }
    }

    async findDocumentColors(
        document: JsonLS.TextDocument,
        doc: JsonLS.JSONDocument,
        context?: JsonLS.ColorInformationContext | undefined
    ): Promise<JsonLS.ColorInformation[]> {
        if (document.languageId === "ssm-json") {
            return await this.jsonLanguageService.findDocumentColors(document, doc, context);
        } else {
            return [];
        }
    }

    getColorPresentations(
        document: JsonLS.TextDocument,
        doc: JsonLS.JSONDocument,
        color: JsonLS.Color,
        range: JsonLS.Range
    ): JsonLS.ColorPresentation[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.getColorPresentations(document, doc, color, range);
        } else {
            return [];
        }
    }

    getFoldingRanges(
        document: JsonLS.TextDocument,
        context?: JsonLS.FoldingRangesContext | undefined
    ): JsonLS.FoldingRange[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.getFoldingRanges(document, context);
        } else {
            return [];
        }
    }

    getSelectionRanges(
        document: JsonLS.TextDocument,
        positions: JsonLS.Position[],
        doc: JsonLS.JSONDocument
    ): JsonLS.SelectionRange[] {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.getSelectionRanges(document, positions, doc);
        } else {
            return [];
        }
    }

    resetSchema(uri: string): boolean {
        const jsonResult = this.jsonLanguageService.resetSchema(uri);
        const yamlResult = this.yamlLanguageService.resetSchema(uri);

        return jsonResult || yamlResult;
    }

    parseJSONDocument(document: JsonLS.TextDocument): JsonLS.JSONDocument {
        if (document.languageId === "ssm-json") {
            return this.jsonLanguageService.parseJSONDocument(document);
        } else {
            const yamlDocument = parseYaml(document.getText());
            return yamlDocument.documents[0];
        }
    }
}

export function getSsmLanguageService(
    workspaceContext: JsonLS.WorkspaceContextService,
    contributions: JsonLS.JSONWorkerContribution[],
    clientCapabilities: JsonLS.ClientCapabilities
): SsmLanguageService {
    const jsonLanguageService = JsonLS.getLanguageService({
        workspaceContext,
        contributions,
        clientCapabilities,
    });
    const yamlLanguageService = YamlLS.getLanguageService(
        () => Promise.reject("SchemaRequestService not provided!"),
        workspaceContext,
        contributions
    );

    const schemaConfiguration: JsonLS.SchemaConfiguration = {
        fileMatch: ["*"],
        uri: "file://schema/ssm-document-schema.json",
        schema: ssmDocumentSchema,
    };

    jsonLanguageService.configure({
        validate: true,
        allowComments: false,
        schemas: [schemaConfiguration],
    });

    yamlLanguageService.configure({
        validate: true,
        hover: true,
        completion: true,
        schemas: [schemaConfiguration],
    });

    return new SsmLanguageServiceImpl(jsonLanguageService, yamlLanguageService);
}
