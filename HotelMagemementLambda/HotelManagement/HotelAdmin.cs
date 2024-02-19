using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using System.Text.Json;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.S3;
using Amazon.S3.Model;
using HotelManagement.Models;
using HttpMultipartParser;

[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace HotelManagement;

public class HotelAdmin
{
    public async Task<APIGatewayProxyResponse> AddHotel(APIGatewayProxyRequest request, ILambdaContext context)
    {
        var response = new APIGatewayProxyResponse
        {
            Headers = new Dictionary<string, string>(),
            StatusCode = 200
        };

        response.Headers.Add("Access-Control-Allow-Origin", "*");
        response.Headers.Add("Access-Control-Allow-Headers", "*");
        response.Headers.Add("Access-Control-Allow-Methods", "OPTIONS,POST");
        response.Headers.Add("Content-Type", "application/json");

        var bodyContent = request.IsBase64Encoded
           ? Convert.FromBase64String(request.Body)
           : Encoding.UTF8.GetBytes(request.Body);

        Console.WriteLine($"Request size after decode: {bodyContent.Length}");

        await using var memoryStream = new MemoryStream(bodyContent);
        var formData = await MultipartFormDataParser.ParseAsync(memoryStream).ConfigureAwait(false);

        var hotelName = formData.GetParameterValue("hotelName");
        var hotelRating = formData.GetParameterValue("hotelRating");
        var hotelCity = formData.GetParameterValue("hotelCity");
        var hotelPrice = formData.GetParameterValue("hotelPrice");

        var file = formData.Files.FirstOrDefault();
        var fileName = file?.FileName;

        if (fileName is null || string.IsNullOrEmpty(hotelName) || string.IsNullOrEmpty(hotelRating) || string.IsNullOrEmpty(hotelCity) || string.IsNullOrEmpty(hotelPrice))
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Bad Request. The following properties are required: ");
            if (string.IsNullOrEmpty(hotelName)) sb.AppendLine("hotelName");
            if (string.IsNullOrEmpty(hotelRating)) sb.AppendLine("hotelRating");
            if (string.IsNullOrEmpty(hotelCity)) sb.AppendLine("hotelCity");
            if (string.IsNullOrEmpty(hotelPrice)) sb.AppendLine("hotelPrice");
            if (fileName is null) sb.AppendLine("photo");

            response.StatusCode = (int)HttpStatusCode.BadRequest;
            response.Body = JsonSerializer.Serialize(new { Error = sb.ToString() });
            return response;
        }

        await using var fileContentStream = new MemoryStream();
        await file!.Data.CopyToAsync(fileContentStream);
        fileContentStream.Position = 0;

        // var userId = formData.GetParameterValue("userId");
        var idToken = request.Headers["Authorization"].Replace("Bearer ", "");

        var token = new JwtSecurityToken(idToken);
        var group = token.Claims.FirstOrDefault(x => x.Type == "cognito:groups");
        if (group == null || group.Value != "Admin")
        {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. Must be a member of Admin group." });
            return response;
        }

        var payload = token.Payload;
        var userId = payload?["sub"]?.ToString();

        if (userId is null)
        {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. User not found." });
            return response;
        }

        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        var bucketName = Environment.GetEnvironmentVariable("bucketName");

        var client = new AmazonS3Client(RegionEndpoint.GetBySystemName(region));
        var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));

        try
        {
            await client.PutObjectAsync(new PutObjectRequest
            {
                BucketName = bucketName,
                Key = fileName,
                InputStream = fileContentStream,
                AutoCloseStream = true,
                // ContentType = file?.ContentType
            });

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

        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        Console.WriteLine("OK.");

        response.Body = JsonSerializer.Serialize(new { Message = "Hotel added successfully." });
        return response;
    }
}
