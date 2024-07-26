import { exec } from '@actions/exec';
import fs from 'fs';
import { getUnityChangeset } from 'unity-changeset';

class SetupMac {
  static unityHubPath = `"/Applications/Unity Hub.app/Contents/MacOS/Unity Hub"`;

  public static async setup(parameters, actionFolder: string) {
    const unityEditorPath = `/Applications/Unity/Hub/Editor/${parameters.editorVersion}/Unity.app/Contents/MacOS/Unity`;

    // Only install unity if the editor doesn't already exist
    if (!fs.existsSync(unityEditorPath)) {
      await SetupMac.installUnityHub();
      await SetupMac.installUnity(parameters);
    }

    await SetupMac.setEnvironmentVariables(parameters, actionFolder);
  }

  private static async installUnityHub(silent = false) {
    const command = 'brew install unity-hub';
    if (!fs.existsSync(this.unityHubPath)) {
      // Ignoring return code because the log seems to overflow the internal buffer which triggers
      // a false error
      const errorCode = await exec(command, undefined, { silent, ignoreReturnCode: true });
      if (errorCode) {
        throw new Error(
          `There was an error installing the Unity Editor. See logs above for details.`,
        );
      }
    }
  }

  private static async installUnity(parameters, silent = false) {
    const unityChangeset = await getUnityChangeset(parameters.editorVersion);
    let command = `${this.unityHubPath} -- --headless install \
                                          --version ${parameters.editorVersion} \
                                          --changeset ${unityChangeset.changeset} `;

    command += `--childModules`;

    // Ignoring return code because the log seems to overflow the internal buffer which triggers
    // a false error
    const errorCode = await exec(command, undefined, { silent, ignoreReturnCode: true });
    if (errorCode) {
      throw new Error(
        `There was an error installing the Unity Editor. See logs above for details.`,
      );
    }
  }

  private static async setEnvironmentVariables(parameters, actionFolder: string) {
    // Need to set environment variables from here because we execute
    // the scripts on the host for mac
    process.env.ACTION_FOLDER = actionFolder;
    process.env.UNITY_VERSION = parameters.editorVersion;
    process.env.UNITY_SERIAL = parameters.unitySerial;
    process.env.UNITY_LICENSING_SERVER = parameters.unityLicensingServer;
    process.env.SKIP_ACTIVATION = parameters.skipActivation;
    process.env.PROJECT_PATH = parameters.projectPath;
    process.env.CUSTOM_PARAMETERS = parameters.customParameters;
    process.env.CHOWN_FILES_TO = parameters.chownFilesTo;
  }
}

export default SetupMac;
