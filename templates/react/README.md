# Extend App UI — Full Example

A full-featured React template with a tournament management UI and generated AGS API clients. Use this as a reference; start from the `react-minimal` template for a blank slate.

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
export AB_ADMINUI_NAME='<YourAppUIName>'
```

Register the App UI, generate the local `.env.local` for AGS API access, and install dependencies:

```bash
extend-helper-cli appui create --namespace $AB_NAMESPACE --name $AB_ADMINUI_NAME
extend-helper-cli appui setup-env --namespace $AB_NAMESPACE --name $AB_ADMINUI_NAME
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the tournament management UI. Edits are reflected immediately.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_ADMINUI_NAME
```
