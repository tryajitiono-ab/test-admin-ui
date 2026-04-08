# Extend App UI — Multiple Extend Apps Example

A full-featured React template that demonstrates managing multiple Extend apps from a single App UI, with generated AGS API clients for each service. Use this as a reference for multi-service UIs; start from the `react-minimal` template for a blank slate. This example uses two instances of the Extend Service Extension Tournament System as the backends: https://github.com/AccelByte/extend-tournament-system.

## Quick start

```bash
npx tiged AccelByte/extend-app-ui-templates/templates/react-multiple-extend-apps my-app-ui
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

Then run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the tournament management UI. Edits are reflected immediately.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
```

## Code generating

1. In `swaggers.json`, replace each `<url-to-your-Nth-extend-service>` with the **Service URL** of the corresponding Extend app. You can find this in the Admin Portal on each Extend app's detail page. Add one entry per Extend app you want to target. For example, after replacing:
   ```json
   [
     ["tournamentapi", "tournamentapi", "tournament.json", "https://<YourFirstServiceURL>/apidocs/api.json"],
     ["secondtournamentapi", "secondtournamentapi", "secondtournament.json", "https://<YourSecondServiceURL>/apidocs/api.json"]
   ]
   ```
2. Run `npm run codegen`. This downloads each Extend service's Swagger spec and generates TypeScript client code for each into a separate subdirectory under `src/codegen/`.

Unlike the single-app `react` template, you do **not** need to set `VITE_AB_EXTEND_APP_NAME`. Each generated client carries the correct service path from its downloaded spec.

### Codegen config

`@accelbyte/codegen` is configured in `abcodegen.config.ts`. In this template, the configuration is:

```ts
{
  // Skips generating index files. These are useful for npm libraries,
  // but unnecessary when the generated code is used locally.
  unstable_shouldProduceIndexFiles: false,

  // Splits generated output into a subdirectory per service name.
  // Required when generating clients for multiple Extend apps to keep
  // each service's types and query functions isolated.
  unstable_splitOutputByServiceName: true,

  // Overrides specific types that don't resolve cleanly in TypeScript.
  unstable_overrideAsAny: {
    ProtobufAny: true
  }
}
```

Note that `basePath` is intentionally not cleared here (unlike the single-app `react` template). Each generated client preserves its own `basePath` from the downloaded spec so requests route to the correct service automatically.
