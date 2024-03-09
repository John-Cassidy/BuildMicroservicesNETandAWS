using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Amazon;
using HotelSearch.Models;
using Amazon.DynamoDBv2.Model;

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

        string city = request.QueryStringParameters.ContainsKey("city") ? request.QueryStringParameters["city"] : null;
        string rating = request.QueryStringParameters.ContainsKey("rating") ? request.QueryStringParameters["rating"] : null;

        return request.HttpMethod.ToUpper() switch {
            "GET" => await HandleGet(request, response, context, city, rating),            
            _ => new APIGatewayProxyResponse {
                StatusCode = (int)HttpStatusCode.NotFound
            }
        };
    }

    public async Task<APIGatewayProxyResponse> HandleGet(APIGatewayProxyRequest request, APIGatewayProxyResponse response, ILambdaContext context, string city = "", string rating = "") {

        context.Logger.LogLine($"City: {city}, Rating: {rating}");

        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET");

        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var hasRating = int.TryParse(rating, out int ratingValue);
        if (!hasRating) {
            ratingValue = 1;
        }

        var queryResult = new List<Hotel>();
        QueryFilter queryFilter = new QueryFilter();
        var indexName = string.Empty;

        bool bScanResults = false;

        var config = new QueryOperationConfig();

        if (!string.IsNullOrEmpty(city) && ratingValue > 1) {
            config.KeyExpression = new Expression {
                ExpressionStatement = "City = :v_city and Rating >= :v_rating",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry> {
                    {":v_city", new Primitive { Value = city }},
                    {":v_rating", new Primitive { Value = ratingValue.ToString() }}
                }
            };
            config.IndexName = "CityRatingIndex";
        } else if (!string.IsNullOrEmpty(city)) {
            config.KeyExpression = new Expression {
                ExpressionStatement = "City = :v_city",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry> {
                    {":v_city", new Primitive { Value = city }}
                }
            };
            config.IndexName = "CityIndex";
        } else if (ratingValue > 1) {
            config.KeyExpression = new Expression {
                ExpressionStatement = "Constant = :v_constant and Rating >= :v_rating",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry> {
                    {":v_constant", new Primitive { Value = "Hotel" }},
                    {":v_rating", new Primitive { Value = ratingValue.ToString() }}
                }
            };
            config.IndexName = "RatingIndex";
        } else {
            bScanResults = true;
        }

        if (bScanResults) {
            var scanResult = await dbContext.ScanAsync<Hotel>(new List<ScanCondition>()).GetRemainingAsync();
            queryResult.AddRange(scanResult);
        } else {
            queryResult.AddRange(await dbContext.FromQueryAsync<Hotel>(config).GetRemainingAsync());
        }
        
        var options = new JsonSerializerOptions {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        response.Body = JsonSerializer.Serialize(new { Hotels = queryResult }, options);

        return response;
    }
}
