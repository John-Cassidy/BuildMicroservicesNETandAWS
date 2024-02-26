using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.S3;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using AutoMapper;
using HotelManagement.Models;
using HttpMultipartParser;
using Microsoft.Extensions.Configuration;

[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace HotelManagement;

public class HotelAdmin
{
    private readonly IConfigurationRoot _configurations;
    private readonly string _s3BucketName;
    private readonly string _snsTopicArn;
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
        _s3BucketName = _configurations["AppSettings:S3:BucketName"];
        _snsTopicArn = _configurations["AppSettings:SNS:TopicArn"];

        _validIssuer = $"https://cognito-idp.{cognitoAWSRegion}.amazonaws.com/{cognitoUserPoolId}";
        _validAudience = appClientId;
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var response = new APIGatewayProxyResponse
        {
            Headers = new Dictionary<string, string>(),
            StatusCode = (int)HttpStatusCode.OK
        };

        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Headers", "*");
        //response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET,POST"); // added in each handler
        response.Headers.Add("Content-Type", "application/json");

        if (request.HttpMethod.ToUpper() == "OPTIONS")
        {
            return response;
        }

        // 1. Return if no bearer token found
        if (string.IsNullOrWhiteSpace(request.Headers["Authorization"]))
        {
            return new APIGatewayProxyResponse
            {
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
        if (!isAdminUser)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = (int)HttpStatusCode.Forbidden
            };
        }

        // 4. Check UserId        
        var token = new JwtSecurityToken(bearerToken.Replace("Bearer ", ""));
        var userId = token.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;

        if (userId is null)
        {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. User not found." });
            return response;
        }

        return request.HttpMethod.ToUpper() switch
        {
            "GET" => request.Resource.Contains("image") && request.QueryStringParameters.ContainsKey("fileName")
                ? await HandleGetImage(request, response, request.QueryStringParameters["fileName"])
                : await HandleGet(request, response, userId),
            "POST" => await HandlePost(request, response, userId),
            _ => response
        };
    }

    private async Task<APIGatewayProxyResponse> HandleGetImage(APIGatewayProxyRequest request, APIGatewayProxyResponse response, string fileName) {
        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        var bucketName = _s3BucketName;
        var client = new AmazonS3Client(RegionEndpoint.GetBySystemName(region));

        using var getObjectResponse = await client.GetObjectAsync(bucketName, fileName);
        using var responseStream = getObjectResponse.ResponseStream;
        var image = new MemoryStream();
        await responseStream.CopyToAsync(image);
        image.Position = 0;

        response.Body = Convert.ToBase64String(image.ToArray());
        response.Headers["Content-Type"] = getObjectResponse.Headers.ContentType;
        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET");

        return response;
    }

    private async Task<APIGatewayProxyResponse> HandleGet(APIGatewayProxyRequest request, APIGatewayProxyResponse response, string userId)
    {
        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET,POST");

        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var hotels = await dbContext.ScanAsync<Hotel>(new[] { new ScanCondition("UserId", ScanOperator.Equal, userId) })
            .GetRemainingAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        response.Body = JsonSerializer.Serialize(new { Hotels = hotels }, options);


        return response;
    }

    private async Task<APIGatewayProxyResponse> HandlePost(APIGatewayProxyRequest request, APIGatewayProxyResponse response, string userId)
    {
        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,GET,POST");
        StringBuilder sbResponse = new StringBuilder();
        try
        {
            var bodyContent = request.IsBase64Encoded
           ? Convert.FromBase64String(request.Body)
           : Encoding.UTF8.GetBytes(request.Body);

            Console.WriteLine($"Request size after decode: {bodyContent.Length}");

            await using var memoryStream = new MemoryStream(bodyContent);
            var formData = await MultipartFormDataParser.ParseAsync(memoryStream).ConfigureAwait(false);

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

            if (file is null || fileName is null || string.IsNullOrEmpty(hotelName) || string.IsNullOrEmpty(hotelRating) || string.IsNullOrEmpty(hotelCity) || string.IsNullOrEmpty(hotelPrice))
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
                if (file is null || fileName is null)
                    sbBadRequest.AppendLine("photo");

                response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Body = JsonSerializer.Serialize(new { Error = sbBadRequest.ToString() });
                return response;
            }

            sbResponse.AppendLine($"Hotel Name: {hotelName}");
            sbResponse.AppendLine($"Hotel Rating: {hotelRating}");
            sbResponse.AppendLine($"Hotel City: {hotelCity}");
            sbResponse.AppendLine($"Hotel Price: {hotelPrice}");
            sbResponse.AppendLine($"File Name: {fileName}");
            sbResponse.AppendLine($"File ContentType: {file!.ContentType}");
            sbResponse.AppendLine($"File Size: {file!.Data.Length} bytes");

            var region = Environment.GetEnvironmentVariable("AWS_REGION");
            var bucketName = _s3BucketName;

            sbResponse.AppendLine($"Region: {region}");
            sbResponse.AppendLine($"Bucket Name: {bucketName}");

            var client = new AmazonS3Client(RegionEndpoint.GetBySystemName(region));
            var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));

            await using var fileStream = new MemoryStream();
            await file!.Data.CopyToAsync(fileStream);
            fileStream.Position = 0;

            await client.PutObjectAsync(new Amazon.S3.Model.PutObjectRequest
            {
                BucketName = bucketName,
                Key = fileName,
                InputStream = fileStream,
                AutoCloseStream = true,
                ContentType = file?.ContentType,
                CannedACL = S3CannedACL.PublicRead
            });

            sbResponse.AppendLine("file uploaded to S3");

            var hotel = new Hotel
            {
                UserId = userId,
                Id = Guid.NewGuid().ToString(),
                Name = hotelName,
                Rating = int.Parse(hotelRating),
                City = hotelCity,
                Price = int.Parse(hotelPrice),
                FileName = fileName
            };

            using var dbContext = new DynamoDBContext(dbClient);
            await dbContext.SaveAsync(hotel);

            sbResponse.AppendLine("hotel saved to DynamoDB");

            var mapperConfig = new MapperConfiguration(cfg =>
                cfg.CreateMap<Hotel, HotelCreatedEvent>()
                    .ForMember(dest => dest.CreationDateTime,
                        opt => opt.MapFrom(src => DateTime.Now))
            );

            var mapper = new Mapper(mapperConfig);

            var hotelCreatedEvent = mapper.Map<Hotel, HotelCreatedEvent>(hotel);


            var snsClient = new AmazonSimpleNotificationServiceClient(RegionEndpoint.GetBySystemName(region));
            var publishResponse = await snsClient.PublishAsync(new PublishRequest
                       {
                Message = JsonSerializer.Serialize(hotelCreatedEvent),
                TopicArn = _snsTopicArn
            });

            sbResponse.AppendLine($"SNS message sent. MessageId: {publishResponse.MessageId}");

        } catch (AmazonS3Exception e) {
            // Handle exception related to AWS S3 service
            Console.WriteLine($"AmazonS3Exception encountered. Message:'{e.Message}' when writing an object");
            response.StatusCode = (int)HttpStatusCode.InternalServerError;
            response.Body = $"AmazonS3Exception encountered. Message:'{e.Message}' when writing an object";
            throw;
        } catch (Exception e)
        {
            Console.WriteLine(e);
            response.StatusCode = (int)HttpStatusCode.InternalServerError;
            response.Body = e.Message;
            throw;
        }
        response.StatusCode = (int)HttpStatusCode.OK;
        response.Body = $"Post to HotelAdmin: {sbResponse.ToString()}";
        return response;
    }
}
