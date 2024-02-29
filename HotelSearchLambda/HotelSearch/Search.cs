using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.Runtime.Internal;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Amazon;
using HotelSearch.Models;

[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace HotelSearch;

public class Search
{

    private readonly IConfigurationRoot _configurations;
    private readonly string _s3BucketName;
    private readonly string _snsTopicArn;
    private string _validIssuer;
    private string _validAudience;

    public Search() {
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
        var response = new APIGatewayProxyResponse {
            Headers = new Dictionary<string, string>(),
            StatusCode = (int)HttpStatusCode.OK
        };

        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Headers", "*");
        //response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET"); // added in each handler
        response.Headers.Add("Content-Type", "application/json");

        if (request.HttpMethod.ToUpper() == "OPTIONS") {
            return response;
        }

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
        bool isMemberUser = claimPrincipal.IsInRole("Member");

        // 3. Check for Admin/Member roles
        if (!isAdminUser && !isMemberUser) {
            return new APIGatewayProxyResponse {
                StatusCode = (int)HttpStatusCode.Forbidden
            };
        }

        return request.HttpMethod.ToUpper() switch {
            "GET" => await HandleGet(request, response, context, request.QueryStringParameters["city"], request.QueryStringParameters["rating"]),            
            _ => response
        };
    }

    public async Task<APIGatewayProxyResponse> HandleGet(APIGatewayProxyRequest request, APIGatewayProxyResponse response, ILambdaContext context, string city, string rating) {
        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET");

        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var hasRating = int.TryParse(rating, out int ratingValue);
        if (!hasRating) {
            ratingValue = 1;
        }

        IEnumerable<ScanCondition> scanConditions = new List<ScanCondition>();
        if (!string.IsNullOrEmpty(city) && ratingValue > 0) {
            scanConditions = new List<ScanCondition>
            {
                new ScanCondition("City", ScanOperator.Contains, city),
                new ScanCondition("Rating", ScanOperator.GreaterThanOrEqual, ratingValue)
            };
        } else if (!string.IsNullOrEmpty(city)) {
            scanConditions = new List<ScanCondition>
            {
                new ScanCondition("City", ScanOperator.Contains, city)
            };
        } else if (ratingValue > 0) {
            scanConditions = new List<ScanCondition>
            {
                new ScanCondition("Rating", ScanOperator.GreaterThanOrEqual, ratingValue)
            };
        }

        var hotels = await dbContext.ScanAsync<Hotel>(scanConditions).GetRemainingAsync();

        var options = new JsonSerializerOptions {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        response.Body = JsonSerializer.Serialize(new { Hotels = hotels }, options);

        return response;
    }
}
