# Extend App UI — useAppUIContext Example

A minimal React example demonstrating how to use `useAppUIContext` and permission checks in an Extend App UI module.

## What this shows

- How to set up `AppUIContextProvider` with `sdkConfig` and `isCurrentUserHasPermission` from `hostContext`
- How to call `useAppUIContext()` inside a component to access `isCurrentUserHasPermission`
- How to conditionally render UI based on whether the current user has a specific permission

## Quick start

```bash
npx tiged AccelByte/extend-app-ui-templates/templates/react-api-reference-example my-app-ui
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

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
```
