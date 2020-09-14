/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    createConnection,
    IConnection,
    InitializeParams,
    InitializeResult,
    RequestType,
    ServerCapabilities,
    TextDocuments,
    TextDocumentSyncKind,
} from "vscode-languageserver";
import * as URL from "url";
import { JsonLS, getSsmLanguageService } from "./ssmLanguageService";
import { DelayedValidationService } from "./util/delayedValidationService";
import { runSafeAsync, runSafe, formatError } from "./util/runner";
import { LimitExceededWarnings } from "./util/limitExceededWarnings";
import { LanguageModelCache } from "./util/languageModelCache";

const forceValidateRequestType: RequestType<string, JsonLS.Diagnostic[], never, never> = new RequestType(
    "ssm/validate"
);

process.on("unhandledRejection", (e: unknown) => {
    console.error(formatError("Unhandled exception", e));
});
process.on("uncaughtException", (e: unknown) => {
    console.error(formatError("Uncaught exception", e));
});

// Create a connection for the server
const connection: IConnection = createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const workspaceContext = {
    resolveRelativePath: (relativePath: string, resource: string) => {
        return URL.resolve(resource, relativePath);
    },
};

// create the JSON language service
let languageService = getSsmLanguageService(workspaceContext, [], JsonLS.ClientCapabilities.LATEST);
const jsonModelsCache = new LanguageModelCache(10, 60, (document) => languageService.parseJSONDocument(document));
let validationService = new DelayedValidationService(languageService, jsonModelsCache, connection);

let clientSnippetSupport = false;
let hierarchicalDocumentSymbolSupport = false;
// let foldingRangeLimitDefault = Number.MAX_VALUE;
const foldingRangeLimit = Number.MAX_VALUE;
const resultLimit = Number.MAX_VALUE;

const limitExceededWarnings = new LimitExceededWarnings(connection);

// Create a text document manager.
const documents = new TextDocuments(JsonLS.TextDocument);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize(
    (params: InitializeParams): InitializeResult => {
        languageService = getSsmLanguageService(workspaceContext, [], params.capabilities);

        validationService = new DelayedValidationService(languageService, jsonModelsCache, connection);

        function getClientCapability<T>(name: string, def: T): T {
            const keys = name.split(".");
            let c = params.capabilities;
            for (let i = 0; c && i < keys.length; i++) {
                // eslint-disable-next-line no-prototype-builtins
                if (!c.hasOwnProperty(keys[i])) {
                    return def;
                }
                c = c[keys[i]];
            }

            return c as T;
        }

        clientSnippetSupport = getClientCapability("textDocument.completion.completionItem.snippetSupport", false);
        // foldingRangeLimitDefault = getClientCapability("textDocument.foldingRange.rangeLimit", Number.MAX_VALUE);
        hierarchicalDocumentSymbolSupport = getClientCapability(
            "textDocument.documentSymbol.hierarchicalDocumentSymbolSupport",
            false
        );

        // Need all letters to be trigger characters for YAML completion
        const triggerCharacters = [
            '"',
            "-",
            "$",
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
        ];

        const capabilities: ServerCapabilities = {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: clientSnippetSupport
                ? { resolveProvider: true, triggerCharacters: triggerCharacters }
                : undefined,
            hoverProvider: true,
            documentSymbolProvider: true,
            // tslint:disable-next-line: no-unsafe-any
            documentRangeFormattingProvider: params.initializationOptions.provideFormatter === true,
            colorProvider: {},
            foldingRangeProvider: true,
            selectionRangeProvider: true,
        };
        console.log("initialized.");
        return { capabilities };
    }
);

// Retry schema validation on all open documents
connection.onRequest(forceValidateRequestType, async (uri) => {
    const document = documents.get(uri);
    if (document && validationService) {
        return await validationService.validateTextDocument(document);
    } else {
        return [];
    }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    limitExceededWarnings.cancel(change.document.uri);
    validationService.triggerValidation(change.document);
});

// a document has closed: clear all diagnostics
documents.onDidClose((event) => {
    limitExceededWarnings.cancel(event.document.uri);
    validationService.cleanPendingValidation(event.document);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

connection.onDidChangeWatchedFiles((change) => {
    // Monitored files have changed in VSCode
    let hasChanges = false;
    // tslint:disable-next-line: no-unsafe-any
    change.changes.forEach((c) => {
        if (languageService.resetSchema(c.uri)) {
            hasChanges = true;
        }
    });
    if (hasChanges) {
        documents.all().forEach((document) => {
            validationService.triggerValidation(document);
        });
    }
});

documents.onDidClose((e) => {
    jsonModelsCache.onDocumentRemoved(e.document);
});

connection.onShutdown(() => {
    jsonModelsCache.dispose();
});

connection.onCompletion((textDocumentPosition, token) => {
    return runSafeAsync(
        async () => {
            const document = documents.get(textDocumentPosition.textDocument.uri);
            if (document) {
                const jsonDocument = jsonModelsCache.get(document);

                return languageService.doComplete(document, textDocumentPosition.position, jsonDocument);
            }

            return undefined;
        },
        undefined,
        `Error while computing completions for ${textDocumentPosition.textDocument.uri}`,
        token
    );
});

connection.onCompletionResolve((completionItem, token) => {
    return runSafeAsync(
        () => {
            return languageService.doResolve(completionItem);
        },
        completionItem,
        "Error while resolving completion proposal",
        token
    );
});

connection.onHover((textDocumentPositionParams, token) => {
    return runSafeAsync(
        async () => {
            const document = documents.get(textDocumentPositionParams.textDocument.uri);
            if (document) {
                const jsonDocument = jsonModelsCache.get(document);
                return languageService.doHover(document, textDocumentPositionParams.position, jsonDocument);
            }

            return undefined;
        },
        undefined,
        `Error while computing hover for ${textDocumentPositionParams.textDocument.uri}`,
        token
    );
});

connection.onDocumentSymbol((documentSymbolParams, token) => {
    return runSafe(
        () => {
            // tslint:disable-next-line no-unsafe-any
            const document = documents.get(documentSymbolParams.textDocument.uri);
            if (document) {
                const jsonDocument = jsonModelsCache.get(document);
                const onResultLimitExceeded = limitExceededWarnings.onResultLimitExceeded(
                    document.uri,
                    resultLimit,
                    "document symbols"
                );
                if (hierarchicalDocumentSymbolSupport) {
                    return languageService.findDocumentSymbols2(document, jsonDocument, {
                        resultLimit,
                        onResultLimitExceeded,
                    });
                } else {
                    return languageService.findDocumentSymbols(document, jsonDocument, {
                        resultLimit,
                        onResultLimitExceeded,
                    });
                }
            }

            return [];
        },
        [],
        `Error while computing document symbols for ${documentSymbolParams.textDocument.uri}`,
        token
    );
});

connection.onDocumentRangeFormatting((formatParams, token) => {
    return runSafe(
        () => {
            const document = documents.get(formatParams.textDocument.uri);
            if (document) {
                return languageService.format(document, formatParams.range, formatParams.options);
            }

            return [];
        },
        [],
        `Error while formatting range for ${formatParams.textDocument.uri}`,
        token
    );
});

connection.onDocumentColor((params, token) => {
    return runSafeAsync(
        async () => {
            const document = documents.get(params.textDocument.uri);
            if (document) {
                const onResultLimitExceeded = limitExceededWarnings.onResultLimitExceeded(
                    document.uri,
                    resultLimit,
                    "document colors"
                );
                const jsonDocument = jsonModelsCache.get(document);

                return languageService.findDocumentColors(document, jsonDocument, {
                    resultLimit,
                    onResultLimitExceeded,
                });
            }

            return [];
        },
        [],
        `Error while computing document colors for ${params.textDocument.uri}`,
        token
    );
});

connection.onColorPresentation((params, token) => {
    return runSafe(
        () => {
            const document = documents.get(params.textDocument.uri);
            if (document) {
                const jsonDocument = jsonModelsCache.get(document);

                return languageService.getColorPresentations(document, jsonDocument, params.color, params.range);
            }

            return [];
        },
        [],
        `Error while computing color presentations for ${params.textDocument.uri}`,
        token
    );
});

connection.onFoldingRanges((params, token) => {
    return runSafe(
        () => {
            const document = documents.get(params.textDocument.uri);
            if (document) {
                const onRangeLimitExceeded = limitExceededWarnings.onResultLimitExceeded(
                    document.uri,
                    foldingRangeLimit,
                    "folding ranges"
                );

                return languageService.getFoldingRanges(document, {
                    rangeLimit: foldingRangeLimit,
                    onRangeLimitExceeded,
                });
            }

            return undefined;
        },
        undefined,
        `Error while computing folding ranges for ${params.textDocument.uri}`,
        token
    );
});

connection.onSelectionRanges((params, token) => {
    return runSafe(
        () => {
            const document = documents.get(params.textDocument.uri);
            if (document) {
                const jsonDocument = jsonModelsCache.get(document);

                return languageService.getSelectionRanges(document, params.positions, jsonDocument);
            }

            return [];
        },
        [],
        `Error while computing selection ranges for ${params.textDocument.uri}`,
        token
    );
});

// Listen on the connection
connection.listen();
