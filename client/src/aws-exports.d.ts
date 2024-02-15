declare module './aws-exports' {
  const awsmobile: {
    // Add the properties from your aws-exports.js file here.
    aws_project_region: string;
    aws_cognito_identity_pool_id: string;
    aws_cognito_region: string;
    aws_user_pools_id: string;
    aws_user_pools_web_client_id: string;
    // And so on...
  };
  export default awsmobile;
}
