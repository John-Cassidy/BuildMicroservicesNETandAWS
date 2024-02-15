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

Install the AWS Amplify CLI in devDependencies in package.json:

```powershell
npm install --save-dev @aws-amplify/cli@latest
```

Configure Amplify with your AWS account. This will prompt you to sign into the AWS Console:

```powershell
npx amplify configure
```

Initialize Amplify in your project directory. This will create the aws-exports.js file:

```powershell
npx amplify init
```

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
