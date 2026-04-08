import { type CodegenConfigOptions } from '@accelbyte/codegen'

export default {
  unstable_shouldProduceIndexFiles: false,
  unstable_splitOutputByServiceName: true,
  unstable_overrideAsAny: {
    ProtobufAny: true
  }
} satisfies CodegenConfigOptions
