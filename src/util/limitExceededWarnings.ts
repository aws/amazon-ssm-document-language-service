/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IConnection, NotificationType } from "vscode-languageserver";
import { posix } from "path";

export const resultLimitReachedNotificationType: NotificationType<string, unknown> = new NotificationType(
    "ssm/resultLimitReached"
);

export class LimitExceededWarnings {
    private readonly pendingWarnings: {
        [uri: string]: { features: { [name: string]: string }; timeout?: NodeJS.Timeout };
    } = {};

    constructor(private readonly connection: IConnection) {}

    public cancel(uri: string): void {
        const warning = this.pendingWarnings[uri];
        if (warning && warning.timeout) {
            clearTimeout(warning.timeout);
            // tslint:disable-next-line: no-dynamic-delete
            delete this.pendingWarnings[uri];
        }
    }

    public onResultLimitExceeded(uri: string, maxResults: number, name: string): (uri: string) => void {
        return () => {
            let warning = this.pendingWarnings[uri];
            if (warning) {
                if (!warning.timeout) {
                    // already shown
                    return;
                }
                warning.features[name] = name;
                warning.timeout.refresh();
            } else {
                warning = { features: { [name]: name } };
                warning.timeout = setTimeout(() => {
                    this.connection.sendNotification(
                        resultLimitReachedNotificationType,
                        `${posix.basename(uri)}: For performance reasons, ${Object.keys(warning.features).join(
                            " and "
                        )} have been limited to ${maxResults} items.`
                    );
                    warning.timeout = undefined;
                }, 2000);
                this.pendingWarnings[uri] = warning;
            }
        };
    }
}
