import iniFile from 'packagesmith.formats.ini';
import multiline from 'packagesmith.formats.multiline';
import repositoryQuestion from 'packagesmith.questions.repository';
import defaultsDeep from 'lodash.defaultsdeep';
import { runProvisionerSet } from 'packagesmith';
export function provisionGit({
  init = true,
  setupGitConfig = true,
  gitConfigOptions = { whitespace: true },
  gitignoreLines = false,
  gitIgnoreOptions,
} = {}) {
  const provision = {};
  if (init) {
    provision['.git'] = {
      type: 'folder',
      command: 'git init -q',
    };
  }
  if (Array.isArray(gitignoreLines) && gitignoreLines.length) {
    provision['.gitignore'] = {
      contents: multiline((gitIgnore) => [ ...gitIgnore, ...gitignoreLines ], gitIgnoreOptions),
    };
  }
  if (setupGitConfig) {
    provision['.git/config'] = {
      questions: [ repositoryQuestion() ],
      contents: iniFile((gitConfig, { repository }) => defaultsDeep(gitConfig, {
        'remote "origin"': {
          url: repository,
          fetch: '+refs/heads/*:refs/remotes/origin/*',
        },
      }, gitConfig), gitConfigOptions),
    };
  }
  return provision;
}
export default provisionGit;

if (require.main === module) {
  runProvisionerSet(process.argv[2] || '.', provisionGit());
}
