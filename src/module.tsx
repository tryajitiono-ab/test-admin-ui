import { createRoot } from 'react-dom/client';
import { FederatedElement } from './federated-element';
import type { ExtendAdminUIModule } from './types';

export const module: ExtendAdminUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container);
    root.render(<FederatedElement hostContext={hostContext} />);

    return root.unmount();
  }
};
