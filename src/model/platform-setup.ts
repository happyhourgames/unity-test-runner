import LicensingServerSetup from './licensing-server-setup';
import { SetupMac } from './platform-setup/';

const PlatformSetup = {
  async setup(parameters, actionFolder: string) {
    if (parameters.unityLicensingServer !== '') {
      LicensingServerSetup.Setup(parameters.unityLicensingServer, parameters.actionFolder);
    }

    switch (process.platform) {
      case 'darwin':
        await SetupMac.setup(parameters, actionFolder);
        break;

      // Add other baseOS's here
    }
  },
};

export default PlatformSetup;
