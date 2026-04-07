# Test Extend App UI

- Clone the repository
- Copy .env.example to .env.local. Keep the predefined values but change the following:
  - `VITE_AB_URL`: the same value as `AB_BASE_URL`.
  - `VITE_AB_NAMESPACE`: your game namespace.
  - `VITE_AB_CLIENT_ID`: your public IAM client ID. Set the redirect URI to http://localhost:5173.
  - `VITE_AB_EXTEND_APP_NAME`: your Extend app name.
- Run `npm install`.
- Ensure that you have the proper Extend Helper CLI variables exported in your CLI session.
- Run `extend-helper-cli adminui create --namespace <your-namespace> --adminui-name <your-app-ui-name>`.
- Run `extend-helper-cli adminui upload --namespace <your-namespace> --adminui-name <your-app-ui-name>`.
