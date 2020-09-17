import { JsonLS } from "../../../ssmLanguageService";
import { SnippetDefinition } from "../../interfaces";

export const deleteImageInputs: JsonLS.JSONSchema = {
    description: "Deletes the specified image and all related snapshots.",
    properties: {
        inputs: {
            properties: {
                ImageId: {
                    description: "The ID of the image to be deleted.",
                    type: "string",
                },
            },
            required: ["ImageId"],
        },
    },
};
