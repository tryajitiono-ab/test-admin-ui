# Extend App UI — Full Example

A full-featured React template with a tournament management UI and generated AGS API clients. Use this as a reference. For a blank slate, start from the `react-minimal` template instead. This example uses the Extend Service Extension Tournament System as the backend: https://github.com/AccelByte/extend-tournament-system.

## Quick start

```bash
npx tiged AccelByte/extend-app-ui-templates/templates/react my-app-ui
cd my-app-ui
```

Export your AGS credentials (keep this terminal session open):

```bash
export AB_BASE_URL='<YourAGSBaseURL>'
export AB_CLIENT_ID='<YourClientID>'
export AB_CLIENT_SECRET='<YourClientSecret>'
export AB_NAMESPACE='<YourGameNamespace>'
export AB_APPUI_NAME='<YourAppUIName>'
```

Register the App UI, generate the local `.env.local` for AGS API access, and install dependencies:

```bash
extend-helper-cli appui create --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
extend-helper-cli appui setup-env --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
npm install
```

Then, in the new `.env.local`, provide your `VITE_AB_EXTEND_APP_NAME`. This is the name of your Extend app (in this template, the UI targets a single Extend app), labeled by the "App Name" in the Extend detail page inside Admin Portal. After that, run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the tournament management UI. Edits are reflected immediately.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
```

## Code generating

1. In `swaggers.json`, replace `<url-to-your-extend-service>` with your service URL. You can find this in the Admin Portal on your Extend app's detail page, labeled **Service URL**. For example, after replacing, the value should be (depending on the tenancy):
   1. Shared Cloud: `https://spaceshooter-mygame.prod.gamingservices.accelbyte.io/ext-spaceshooter-mygame-myextendapp/apidocs/api.json`, where `spaceshooter-mygame` is the namespace and `myextendapp` is the Extend app name.
   2. Private Cloud: `https://dev.customer.accelbyte.io/ext-mygame-myextendapp/apidocs/api.json`, where `mygame` is the namespace and `myextendapp` is the Extend app name.
2. Run `npm run codegen`. This downloads your Extend service's Swagger spec and generates TypeScript client code from it.

### Codegen config

`@accelbyte/codegen` provides several configuration options to cater to Extend App UI scenarios, configured in `abcodegen.config.ts`. In this template, the configuration is as follows:

```ts
{
  // Nullify the effect of Swagger's `basePath` from the code-generated TypeScript files. This is because we want to define the
  // Extend app name in `src/module.tsx`, so the Extend app name and namespace are not committed to source control in any way.
  basePath: '',
  // By default, the codegen will produce index files (which is useful for libraries published in npm). But, since we are using this locally,
  // we do not need those index files.
  unstable_shouldProduceIndexFiles: false,
  // Occasionally, a type from the Swagger spec doesn't resolve cleanly to a TypeScript type. You can override it and set the type to any.
  unstable_overrideAsAny: {
    ProtobufAny: true
  }
}
```

The `ProtobufAny` type above maps to this schema in the Swagger JSON:

```json
{
  "protobufAny": {
    "type": "object",
    "properties": {
      "@type": {
        "type": "string"
      }
    },
    "additionalProperties": {}
  }
}
```
