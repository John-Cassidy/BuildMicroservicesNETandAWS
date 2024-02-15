// // AWS-Amplify

// import '@aws-amplify/ui-react/styles.css';

// import {
//   WithAuthenticatorProps,
//   withAuthenticator,
// } from '@aws-amplify/ui-react';

// import { Amplify } from 'aws-amplify';
// import awsExports from '../../aws-exports';

// Amplify.configure(awsExports);

// interface Props extends WithAuthenticatorProps {
//   isPassedToWithAuthenticator: boolean;
//   children: any;
// }
// const AuthWrapper = ({
//   isPassedToWithAuthenticator,
//   signOut,
//   user,
//   children,
// }: Props) => {
//   if (!isPassedToWithAuthenticator) {
//     throw new Error(`isPassedToWithAuthenticator was not provided`);
//   }
//   return (
//     <>
//       <h1>Hello {user?.username}</h1>
//       <button onClick={signOut}>Sign out</button>
//       {children}
//     </>
//   );
// };

// export default withAuthenticator(AuthWrapper);

// export async function getStaticProps() {
//   return {
//     props: {
//       isPassedToWithAuthenticator: true,
//     },
//   };
// }
