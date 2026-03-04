import { AccelByte } from '@accelbyte/sdk';
import { useCommonConfigurationAdminApi_GetConfig_ByConfigKey } from '@accelbyte/sdk-config/react-query';
import { BrowserRouter, Route, Routes, useParams } from 'react-router';
import type { HostContext } from './types';
import { createContext, useContext, type PropsWithChildren } from 'react';

const context = createContext<HostContext>(null!);
function ContextProvider({
  children,
  hostContext
}: PropsWithChildren<{ hostContext: HostContext }>) {
  return <context.Provider value={hostContext}>{children}</context.Provider>;
}

const useHostContext = () => useContext(context);

export function FederatedElement({
  hostContext
}: {
  hostContext: HostContext;
}) {
  return (
    <ContextProvider hostContext={hostContext}>
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<Home />} />
          <Route path="/:configKey" element={<GameConfig />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

function Home() {
  return <div>Home</div>;
}

const sdk = AccelByte.SDK({
  coreConfig: {
    baseURL: import.meta.env.AGS_URL,
    clientId: '',
    namespace: '',
    redirectURI: ''
  }
});

function GameConfig() {
  const { namespace } = useHostContext();
  const { configKey } = useParams();

  const configFetcher = useCommonConfigurationAdminApi_GetConfig_ByConfigKey(
    sdk,
    {
      configKey: configKey!,
      coreConfig: {
        namespace
      }
    }
  );

  return (
    <div>
      <section>
        <h1>Game config</h1>

        <div>
          {configFetcher.error ? (
            <div>Error fetching config</div>
          ) : configFetcher.data ? (
            <div>{configFetcher.data.value}</div>
          ) : configFetcher.isLoading ? (
            'Loading...'
          ) : null}
        </div>
      </section>
    </div>
  );
}
