using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace HotelOrder.Validators;

public interface ICognitoAuthority {
    Task<ClaimsPrincipal> ValidateTokenAsync(string jwtToken);
    Task<string?> GetUserId(ClaimsPrincipal user, HttpRequest request);
}

public class CognitoAuthority: ICognitoAuthority {
    private readonly string _Issuer;
    private readonly string? _Audience;

    public CognitoAuthority(IConfiguration configuration)
    {
        string? cognitoAppClientId = configuration["AppSettings:Cognito:AppClientId"]?.ToString();
        string? cognitoUserPoolId = configuration["AppSettings:Cognito:UserPoolId"]?.ToString();
        string? cognitoAWSRegion = configuration["AppSettings:Cognito:AWSRegion"]?.ToString();

        _Issuer = $"https://cognito-idp.{cognitoAWSRegion}.amazonaws.com/{cognitoUserPoolId}";
        _Audience = cognitoAppClientId;
    }
    public async Task<ClaimsPrincipal> ValidateTokenAsync(string jwtToken) {
        try {
            if (string.IsNullOrWhiteSpace(jwtToken)) {
                throw new Exception("Missing identity bearer token");
            }

            jwtToken = jwtToken.Replace("Bearer", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();

            var metadataEndpoint = $"{_Issuer}/.well-known/openid-configuration";

            var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(metadataEndpoint, new OpenIdConnectConfigurationRetriever(), new HttpDocumentRetriever());
            var discoveryDocument = await configurationManager.GetConfigurationAsync();
            var signingKeys = discoveryDocument.SigningKeys;

            var tokenValidationParameters = new TokenValidationParameters() {
                ValidateAudience = true,
                ValidAudiences = new string[] { _Audience }, // list all audiences
                ValidateIssuer = true,
                ValidIssuer = _Issuer,
                RequireSignedTokens = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys,
                RoleClaimType = "cognito:groups"
            };

            SecurityToken validatedToken = new JwtSecurityToken();

            var tokenHandler = new JwtSecurityTokenHandler();

            return tokenHandler.ValidateToken(jwtToken, tokenValidationParameters, out validatedToken);
        } catch {
            throw;
        }
    }

    public async Task<string?> GetUserId(ClaimsPrincipal user, HttpRequest request) {
        if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("AWS_EXECUTION_ENV")))
            return user.FindFirstValue("cognito:username");
        else {
            if (string.IsNullOrWhiteSpace(request.Headers["Authorization"]))
                return null;

            string bearerToken = request.Headers["Authorization"]!;

            ClaimsPrincipal claimPrincipal = await this.ValidateTokenAsync(bearerToken);
            if (!claimPrincipal?.Identity?.IsAuthenticated ?? false) return null;
            if (!claimPrincipal?.IsInRole("Member") ?? false) return null;

            return claimPrincipal.Claims.FirstOrDefault(c => c.Type == "cognito:username")?.Value;
        }
    }
}