# Hotel Booking Application

## Create React App using Vite

[Documentation](https://vitejs.dev/guide/)

```powershell

npm create vite@latest

√ Project name: ... client
√ Select a framework: » React
√ Select a variant: » TypeScript + SWC

Done. Now run:

  cd client
  npm install
  npm run start
```

## Packages

- Material UI: v4 - import {Container} from "@mui/material"
- Axios
- Redux
- Forms (React-hook-form)
- React-Router - version????

### Material UI

[Documentation](https://mui.com/material-ui/)

```powershell
npm install @mui/material @emotion/react @emotion/styled

npm install @fontsource/roboto

npm install @mui/icons-material @mui/lab

```

### React Router

[Documentation React Router v6+](https://reactrouter.com/en/main/start/overview)

```powershell
npm i react-router-dom
```

### Axios

HTTP Client

```powershell
npm install axios
```

### react-toastify

[NPM](https://www.npmjs.com/package/react-toastify)
[Playground](https://fkhadra.github.io/react-toastify/introduction/)
[Using React-Toastify to style your toast messages](https://blog.logrocket.com/using-react-toastify-style-toast-messages/)

```powershell
npm i react-toastify
```

## AWS Cognito and Amplify

[Cognito Integrate App](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-integrate-apps.html)

[Amplify Dev Center / Getting Started](https://ui.docs.amplify.aws/react/getting-started/installation)

### Basic Instructions

Install the AWS Amplify CLI Locally in devDependencies in `package.json`:

```powershell
npm install --save-dev @aws-amplify/cli@latest
```

Initialize Amplify in your project directory. This will create the `aws-exports.js` file:

```powershell
npx amplify init
Note: It is recommended to run this command from the root of your app directory
? Enter a name for the project client
The following configuration will be applied:

Project information
| Name: client
| Environment: dev
| Default editor: Visual Studio Code
| App type: javascript
| Javascript framework: react
| Source Directory Path: src
| Distribution Directory Path: build
| Build Command: npm.cmd run-script build
| Start Command: npm.cmd run-script start

? Initialize the project with the above configuration? Yes
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use default
Adding backend environment dev to AWS Amplify app: xxxxx

Deploying resources into dev environment. This will take a few minutes. ⠙
Deployed root stack client [ ======================================== ] 4/4
        amplify-client-dev-xxxx      AWS::CloudFormation::Stack     CREATE_COMPLETE                Thu Feb 15
        AuthRole                       AWS::IAM::Role                 CREATE_COMPLETE                Thu Feb 15
        UnauthRole                     AWS::IAM::Role                 CREATE_COMPLETE                Thu Feb 15
        DeploymentBucket               AWS::S3::Bucket                CREATE_COMPLETE                Thu Feb 15

"amplify status" will show you what you've added already and if it's locally configured or deployed
"amplify add <category>" will allow you to add features like user login or a backend API
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify console" to open the Amplify Console and view your project status
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud
```

Import the existing Cognito User Pool and Identity Pool:

```powershell
npx amplify import auth
Using service: Cognito, provided by: awscloudformation
√ What type of auth resource do you want to import? · Cognito User Pool only
√ Select the User Pool you want to import: · xxxx
✔ Only one Web app client found: 'web' was automatically selected.
✔ Only one Native app client found: 'web' was automatically selected.
⚠️ ⚠️ It is recommended to use different app client for web and native application.

✅ Cognito User Pool 'hotel-booking-users' was successfully imported.

Next steps:

- This resource will be available for GraphQL APIs ('amplify add api')
- Use Amplify libraries to add sign up, sign in, and sign out capabilities to your client
  application.
  - iOS: https://docs.amplify.aws/lib/auth/getting-started/q/platform/ios
  - Android: https://docs.amplify.aws/lib/auth/getting-started/q/platform/android
  - JavaScript: https://docs.amplify.aws/lib/auth/getting-started/q/platform/js
```

The command will import an existing Cognito User Pool and Identity Pool into your Amplify project, even after you've initialized your Amplify project with `npx amplify init`.

During the `amplify import auth` process, you'll be asked to provide the details of your existing Cognito User Pool and Identity Pool, such as the User Pool ID and the Identity Pool ID. You can find these details in the AWS Management Console, under the Cognito service.

After you've provided these details, Amplify will import these resources into your project and update the aws-exports.js file with the configuration details of these resources.

After you've completed these steps, the `aws-exports.js` file will be created/edited in your project's `src/` directory. This file contains the configuration details for all the backend resources in your Amplify project, including the Cognito User Pool and Identity Pool you've imported.

Remember to replace `npx amplify` with `amplify` if you have installed the Amplify CLI globally.

---

To integrate the `aws-amplify` and `@aws-amplify/ui-react` packages into your React TypeScript project and set up sign-up, sign-in, and sign-out, follow these steps:

Install the necessary packages:

```powershell
npm install aws-amplify @aws-amplify/ui-react
```

Configure Amplify in your main app file (e.g., `App.tsx`):

```tsx
import Amplify from 'aws-amplify';
import config from './aws-exports';

Amplify.configure(config);
```

Use the `withAuthenticator` HOC (Higher Order Component) to add authentication to your app:

```tsx
import { withAuthenticator } from '@aws-amplify/ui-react';

// Your main component here
const App = () => <div>{/* Your app code here */}</div>;

export default withAuthenticator(App);
```

The `withAuthenticator` HOC automatically provides a sign-up/sign-in interface for your app. To sign out, use the `AmplifySignOut` component from `@aws-amplify/ui-react`:

```tsx
import { AmplifySignOut } from '@aws-amplify/ui-react';

const App = () => (
  <div>
    {/* Your app code here */}
    <AmplifySignOut />
  </div>
);

export default withAuthenticator(App);
```

Note: The `aws-exports.js` file is automatically created when you run `amplify init` in your project directory. This file contains all the necessary configuration for your AWS resources. If you haven't run `amplify init` yet, you'll need to do so before you can use Amplify in your project.

## New
