import { type CodegenConfigOptions } from '@accelbyte/codegen'

export default {
  // Override the base path prepended to all API routes.
  // Default: uses basePath from the swagger spec.
  basePath: '',

  // Skip generation of barrel index files (index.ts, all-query-imports.ts).
  // Default: true
  unstable_shouldProduceIndexFile: false,

  // Force specific definitions to emit `z.any()` instead of a full schema.
  // Keyed by definition file name. Value can be `true` or a function receiving the schema.
  unstable_overrideAsAny: {
    ProtobufAny: true
  }
} satisfies CodegenConfigOptions
