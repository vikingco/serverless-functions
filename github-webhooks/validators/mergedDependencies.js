/**
 * Merged dependencies.
 *
 * Checks whether any dependencies that are managed by ourselves (vikingco) are actually merged to master.
 * This can be used to prevent merging a branch while its dependencies are not yet merged.
 **/

const octokit = require('../lib/octokit');
const gitHubClient = require('../lib/github');

class MergedDependenciesValidator {

    _masterRef = null;

    /**
     * Validates if there are any dependencies that are still on feature branches.
     * @param {string} prNumber - Number of the Pull Request
     * @param {string} repoName - Repository to fetch information from
     * @param {string} commitHash - SHA1 hash of the commit to set a status for (HEAD)
     * @param {string} prBody - Body of the pull request message
     */
    async validateMergedDependencies(prNumber, repoName) {
        const [ owner, repo ] = repoName.split('/');
        const pr = (await octokit.pulls.get({ owner, repo, pull_number: prNumber })).data;
        const changedDependencies = (await octokit.dependencyGraph
            .diffRange({ owner, repo, basehead: `${pr.base.ref}...${pr.head.sha}` })).data;

        const unmergedDependencies = await this.findUnmergedDependencies(
            changedDependencies.filter((d) => d.change_type === 'added')
        );

        console.log('Unmerged dependencies: '+JSON.stringify(unmergedDependencies));

        if (unmergedDependencies.length > 0) {
            let description = `Unmerged dependencies found: ${unmergedDependencies.map((d) => d.name).join(', ')}.`;
            gitHubClient.setCommitStatus(repoName, pr.head, gitHubClient.COMMITSTATUS.FAILURE,
                description, 'github-tools/mergedDependencies');
        } else {
            gitHubClient.setCommitStatus(repoName, pr.head, gitHubClient.COMMITSTATUS.SUCCESS,
                'all dependencies merged', 'github-tools/mergedDependencies');
        }
    };

    async findUnmergedDependencies(dependencies) {
        const result = [];
        for (const dependency of dependencies) {
            console.log(`Checking dependency: ${JSON.stringify(dependency)}`);
            if (!(await this.isOnMaster(dependency))) result.push(dependency);
        }
        return result;
    }

    async getMasterRef() {
        if (!this._masterRef) {
            this._masterRef = (await gitHubClient.getBranch('master')).ref;
        }
        return this._masterRef;
    }

    async isOnMaster(dependency) {
        // TODO: this might be formulated differently for python dependencies
        const matcher = /(Vikingco)\/([^/#]+)#([a-f0-9]+)/.exec(dependency.version);
        if (!matcher) {
            console.error(`Failed to interpret as github commit: ${dependency.version}`)
        }

        const [_, owner, repo, ref] = matcher;

        if (ref === 'master') return true;
        const masterRef = await this.getMasterRef();
        if (ref === masterRef) return true;
        const compare = await octokit.repos.compareCommitsWithBasehead({ owner, repo, basehead: `master...${ref}` });
        // assumption: not clear what the response type for oktokit it, so let's check it with the debugger
        return compare.length === 0;
    }
}

module.exports = new MergedDependenciesValidator();


