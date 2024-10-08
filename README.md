# Serverless Stack

This repository contains all my serverless functions currently hosted on AWS.

## Configuration

Create AWS access as described [here][aws-setup-link].
Using the received credentials, add a profile to `~/.aws/credentials`:

```
[profileName]
aws_access_key_id=***************
aws_secret_access_key=***************
```

## Setup

[Serverless][sls] is included as a dependency in the root of the repository to make sure the version is pinned cross functions.
It's advised to use `yarn` over `npm` as we're 2018 (and it's faster too 😄).

    $ yarn install

When you want to initialize a function, navigate to the folder and install it's dependencies.

    $ cd github-webhooks
    $ yarn install

Each function is configured to use serverless included in the root of the repository.

## Debugging

I advise to use [Visual Studio Code][vscode] given that the debug task is included in the project, feel free to create a PR if you wan't to add other integrations. Pressing `F5` will use [serverless-offline][sol] to start a debug session and run the function.

_Beware: setting breakpoints might tell you they can't be bound, this is not true._

Use any tool of choice to invoke http functions and have fun.

## Secure Variables

The runtime variables are included in the project. The [serverless-secrets-plugin][sspl] is used to encrypt and decrypt them.

    $ yarn sls encrypt --password correcthorsebatterystaple --stage production

## Deployment

Create the file `secrets.production.yml` with the environment variables `GITHUB_API_KEY` and `GITHUB_API_KEY`. The values for these can be found in the Bitwarden secret: `github-webhooks-old-serverless-functions` 
Pull in the dependencies, install the Serverless plugins and use the deploy command.

    $ cd github-webhooks
    $ yarn install
    $ serverless plugin install -n serverless-offline
    $ serverless plugin install -n serverless-secrets-plugin
    $ serverless plugin install -n serverless-plugin-resource-tagging
    $ AWS_SDK_LOAD_CONFIG=1 sls deploy

[aws-setup-link]: https://serverless.com/framework/docs/providers/aws/guide/credentials#creating-aws-access-keys
[sls]: https://serverless.com/
[vscode]: https://code.visualstudio.com/
[sspl]: https://github.com/serverless/serverless-secrets-plugin
[sol]: https://github.com/dherault/serverless-offline
