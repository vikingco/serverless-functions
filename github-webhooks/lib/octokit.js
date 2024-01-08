// uses the newer oktokit library. In due time we might migrate to github.js, but for now it still works and we
// have better things to do.

const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_API_KEY });
module.exports = octokit;