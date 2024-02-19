using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
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
        var hotelAddress = formData.GetParameterValue("hotelAddress");
        var hotelCity = formData.GetParameterValue("hotelCity");
        var hotelPrice = formData.GetParameterValue("hotelPrice");

        var file = formData.Files.FirstOrDefault();
        var fileName = file?.FileName;

        if (fileName is null || string.IsNullOrEmpty(hotelName) || string.IsNullOrEmpty(hotelAddress) || string.IsNullOrEmpty(hotelCity) || string.IsNullOrEmpty(hotelPrice))
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Bad Request. The following properties are required: ");
            if (string.IsNullOrEmpty(hotelName)) sb.AppendLine("hotelName");
            if (string.IsNullOrEmpty(hotelAddress)) sb.AppendLine("hotelAddress");
            if (string.IsNullOrEmpty(hotelCity)) sb.AppendLine("hotelCity");
            if (string.IsNullOrEmpty(hotelPrice)) sb.AppendLine("hotelPrice");
            if (fileName is null) sb.AppendLine("photo");

            response.StatusCode = (int)HttpStatusCode.BadRequest;
            response.Body = JsonSerializer.Serialize(new { Error = sb.ToString() });
            return response;
        }

        // var userId = formData.GetParameterValue("userId");
        var idToken = request.Headers["Authorization"].Replace("Bearer ", "");

        var token = new JwtSecurityToken(idToken);
        var group = token.Claims.FirstOrDefault(x => x.Type == "cognito:groups");
        if (group == null || group.Value != "Admin")
        {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. Must be a member of Admin group." });
        }

        var payload = token.Payload;
        var userId = payload?["sub"]?.ToString();

        if (userId is null)
        {
            response.StatusCode = (int)HttpStatusCode.Unauthorized;
            response.Body = JsonSerializer.Serialize(new { Error = "Unauthorized. User not found." });
            return response;
        }

        Console.WriteLine("OK.");

        return response;
    }
}
