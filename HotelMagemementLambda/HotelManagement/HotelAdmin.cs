using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using HttpMultipartParser;
using Microsoft.Extensions.Configuration;

[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace HotelManagement;

public class HotelAdmin
{
    private readonly IConfigurationRoot _configurations;
    private string _validIssuer;
    private string _validAudience;

    public HotelAdmin() 
    {
        _configurations = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
             .AddJsonFile("appsettings.json", optional: true)
             .AddEnvironmentVariables()
             .Build();

        string appClientId = _configurations["AppSettings:Cognito:AppClientId"];
        string cognitoUserPoolId = _configurations["AppSettings:Cognito:UserPoolId"];
        string cognitoAWSRegion = _configurations["AppSettings:Cognito:AWSRegion"];

        _validIssuer = $"https://cognito-idp.{cognitoAWSRegion}.amazonaws.com/{cognitoUserPoolId}";
        _validAudience = appClientId;
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var response = new APIGatewayProxyResponse
        {
            Headers = new Dictionary<string, string>(),
            StatusCode = 200
        };

        // 1. Return if no bearer token found
        if (string.IsNullOrWhiteSpace(request.Headers["Authorization"])) {
            return new APIGatewayProxyResponse {
                StatusCode = (int)HttpStatusCode.Unauthorized
            };
        }

        // 2. Manually validate the token and obtain claim principal
        string bearerToken = request.Headers["Authorization"];
        ClaimsPrincipal claimPrincipal = await JWTValidator.ValidateTokenAsync(bearerToken, _validAudience, _validIssuer);

        string name = claimPrincipal.Identity!.Name!;
        bool isAdminUser = claimPrincipal.IsInRole("Admin");
        var claims = claimPrincipal.Claims.Select(item => new KeyValuePair<string, string>(item.Type, item.Value)).ToList();

        // 3. Check for Admin role
        if (!isAdminUser) {
            return new APIGatewayProxyResponse {
                StatusCode = (int)HttpStatusCode.Forbidden
            };
        }

        // 4. Check UserId        
        var token = new JwtSecurityToken(bearerToken.Replace("Bearer ", ""));
        var userId = token.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;

        if (userId is null) {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. User not found." });
            return response;
        }

        return request.HttpMethod.ToUpper() switch
        {
            "OPTIONS" => HandleOptions(request, response),
            "GET" => HandleGet(request, response, userId),
            "POST" => await HandlePost(request, response, userId),
            _ => response
        };
    }

    private APIGatewayProxyResponse HandleGet(APIGatewayProxyRequest request, APIGatewayProxyResponse response, string userId)
    {
        response.StatusCode = (int)HttpStatusCode.OK;
        response.Body = "Get from HotelAdmin";
        return response;
    }

    private async Task<APIGatewayProxyResponse> HandlePost(APIGatewayProxyRequest request, APIGatewayProxyResponse response, string userId)
    {
        StringBuilder sbResponse = new StringBuilder();
        try
        {
            // add await to simulate async operation
            await Task.Delay(100);
            var bodyContent = request.IsBase64Encoded
           ? Convert.FromBase64String(request.Body)
           : Encoding.UTF8.GetBytes(request.Body);

            Console.WriteLine($"Request size after decode: {bodyContent.Length}");

            await using var memoryStream = new MemoryStream(bodyContent);
            var formData = await MultipartFormDataParser.ParseAsync(memoryStream).ConfigureAwait(false);

            // Check if any form data fields were found
            if (!formData.Parameters.Any())
            {
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Body = JsonSerializer.Serialize(new { Error = "Bad Request. No form data fields were found." });
                return response;
            }

            var hotelName = formData.GetParameterValue("hotelName");
            var hotelRating = formData.GetParameterValue("hotelRating");
            var hotelCity = formData.GetParameterValue("hotelCity");
            var hotelPrice = formData.GetParameterValue("hotelPrice");

            var file = formData.Files.FirstOrDefault();
            var fileName = file?.FileName;

            sbResponse.AppendLine($"Hotel Name: {hotelName}");
            sbResponse.AppendLine($"Hotel Rating: {hotelRating}");
            sbResponse.AppendLine($"Hotel City: {hotelCity}");
            sbResponse.AppendLine($"Hotel Price: {hotelPrice}");
            sbResponse.AppendLine($"File Name: {fileName}");

            if (fileName is null || string.IsNullOrEmpty(hotelName) || string.IsNullOrEmpty(hotelRating) || string.IsNullOrEmpty(hotelCity) || string.IsNullOrEmpty(hotelPrice))
            {
                StringBuilder sbBadRequest = new StringBuilder();
                sbBadRequest.AppendLine("Bad Request. The following properties are required: ");
                if (string.IsNullOrEmpty(hotelName))
                    sbBadRequest.AppendLine("hotelName");
                if (string.IsNullOrEmpty(hotelRating))
                    sbBadRequest.AppendLine("hotelRating");
                if (string.IsNullOrEmpty(hotelCity))
                    sbBadRequest.AppendLine("hotelCity");
                if (string.IsNullOrEmpty(hotelPrice))
                    sbBadRequest.AppendLine("hotelPrice");
                if (fileName is null)
                    sbBadRequest.AppendLine("photo");

                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Body = JsonSerializer.Serialize(new { Error = sbBadRequest.ToString() });
                return response;
            }

            await using var fileContentStream = new MemoryStream();
            await file!.Data.CopyToAsync(fileContentStream);
            fileContentStream.Position = 0;


        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        response.StatusCode = (int)HttpStatusCode.OK;
        response.Body = $"Post to HotelAdmin: {sbResponse.ToString()}";
        return response;
    }

    private APIGatewayProxyResponse HandleOptions(APIGatewayProxyRequest request, APIGatewayProxyResponse response)
    {
        response.StatusCode = (int)HttpStatusCode.OK;
        return response;
    }
}
