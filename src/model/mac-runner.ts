import { existsSync, mkdirSync } from 'fs';
import { exec } from '@actions/exec';
import path from 'path';

const MacRunner = {
  async run(parameters, silent = false) {
    const runCommand = this.getMacCommand(parameters);
    await exec(runCommand, undefined, { silent });
  },

  getMacCommand(parameters): string {
    const {
      actionFolder,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      gitPrivateToken,
      githubToken,
      runnerTemporaryPath,
    } = parameters;

    const githubHome = path.join(runnerTemporaryPath, '_github_home');
    if (!existsSync(githubHome)) mkdirSync(githubHome);
    const githubWorkflow = path.join(runnerTemporaryPath, '_github_workflow');
    if (!existsSync(githubWorkflow)) mkdirSync(githubWorkflow);
    const testPlatforms = (
      testMode === 'all' ? ['playmode', 'editmode', 'COMBINE_RESULTS'] : [testMode]
    ).join(';');
    const entrypointFile = `${actionFolder}/platforms/mac/entrypoint.sh`;

    return `env TEST_PLATFORMS="${testPlatforms}" \
                CUSTOM_PARAMETERS="${customParameters}" \
                COVERAGE_OPTIONS="${coverageOptions}" \
                COVERAGE_RESULTS_PATH="CodeCoverage" \
                ARTIFACTS_PATH="${artifactsPath}" \
                GIT_PRIVATE_TOKEN="${gitPrivateToken}" \
                USE_EXIT_CODE=${githubToken ? 'false' : 'true'} \
                /bin/bash -c "chmod +x '${entrypointFile}'; bash '${entrypointFile}'"`;
  },
};

export default MacRunner;
