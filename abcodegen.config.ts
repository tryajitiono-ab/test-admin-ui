import { type CodegenConfigOptions } from '@accelbyte/codegen'

export default {
  unstable_shouldProduceIndexFiles: false,
  unstable_overrideAsAny: {
    ProtobufAny: true
  }
} satisfies CodegenConfigOptions
