/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { JsonLS } from "../ssmLanguageService";

export class LanguageModelCache<T> {
    private languageModels: {
        [uri: string]: { version: number; languageId: string; cTime: number; languageModel: T };
    } = {};
    private nModels = 0;
    private cleanupInterval: NodeJS.Timer | undefined;

    constructor(
        private readonly maxEntries: number,
        private readonly cleanupIntervalTimeInSec: number,
        private readonly parseFn: (document: JsonLS.TextDocument) => T
    ) {
        if (cleanupIntervalTimeInSec > 0) {
            this.cleanupInterval = setInterval(() => {
                const cutoffTime = Date.now() - cleanupIntervalTimeInSec * 1000;
                const uris = Object.keys(this.languageModels);
                for (const uri of uris) {
                    const languageModelInfo = this.languageModels[uri];
                    if (languageModelInfo.cTime < cutoffTime) {
                        // tslint:disable-next-line: no-dynamic-delete
                        delete this.languageModels[uri];
                        this.nModels--;
                    }
                }
            }, cleanupIntervalTimeInSec * 1000);
        }
    }

    get(document: JsonLS.TextDocument): T {
        const version = document.version;
        const languageId = document.languageId;
        const languageModelInfo = this.languageModels[document.uri];
        if (languageModelInfo && languageModelInfo.version === version && languageModelInfo.languageId === languageId) {
            languageModelInfo.cTime = Date.now();

            return languageModelInfo.languageModel;
        }
        const languageModel = this.parseFn(document);
        this.languageModels[document.uri] = { languageModel, version, languageId, cTime: Date.now() };
        if (!languageModelInfo) {
            this.nModels++;
        }

        if (this.nModels === this.maxEntries) {
            let oldestTime = Number.MAX_VALUE;
            let oldestUri;
            for (const uri of Object.keys(this.languageModels)) {
                const languageModelDetails = this.languageModels[uri];
                if (languageModelDetails.cTime < oldestTime) {
                    oldestUri = uri;
                    oldestTime = languageModelDetails.cTime;
                }
            }
            if (oldestUri) {
                // tslint:disable-next-line: no-dynamic-delete
                delete this.languageModels[oldestUri];
                this.nModels--;
            }
        }

        return languageModel;
    }

    public onDocumentRemoved(document: JsonLS.TextDocument): void {
        const uri = document.uri;
        if (this.languageModels[uri]) {
            // tslint:disable-next-line: no-dynamic-delete
            delete this.languageModels[uri];
            this.nModels--;
        }
    }

    public dispose(): void {
        if (typeof this.cleanupInterval !== "undefined") {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
            this.languageModels = {};
            this.nModels = 0;
        }
    }
}
