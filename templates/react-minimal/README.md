# Extend App UI — Minimal Template

A blank-slate React template for building Extend App UIs that embed in the AGS Admin Portal.

## Quick start

```bash
npx tiged AccelByte/extend-app-ui-templates/templates/react-minimal my-app-ui
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

Register the App UI and install dependencies:

```bash
extend-helper-cli appui create --namespace $AB_NAMESPACE --name $AB_ADMINUI_NAME
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see a "Hello world!" page. Edits are reflected immediately.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_ADMINUI_NAME
```
