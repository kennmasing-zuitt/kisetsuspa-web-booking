import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Types for the PUBLIC booking API only. The schema file is printed by the server:
 *   (server) npm run schema:print -- schema.graphql booking.schema.graphql
 * so this site can't even type-check a staff operation.
 */
const config: CodegenConfig = {
    schema: "../kisetsu-scheduler-server/booking.schema.graphql",
    documents: ["src/**/*.graphql"],
    ignoreNoDocuments: true,
    generates: {
        "./src/gql/": {
            preset: "client",
            presetConfig: { fragmentMasking: false },
            config: {
                documentMode: "string",
                scalars: { DateTime: "string" },
            },
        },
    },
};

export default config;
