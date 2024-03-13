using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using HotelOrder.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelOrder.Controllers;

[Authorize(Roles = "Admin,HotelManager,Member")]
[Route("[controller]")]
[ApiController]
public class HotelController : ControllerBase {
    
    [HttpGet]
    public async Task<IEnumerable<Hotel>> Get([FromServices] IConfiguration configuration) {
        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var result = new List<Hotel>();
        var scanResult = await dbContext.ScanAsync<Hotel>(new List<ScanCondition>()).GetRemainingAsync();
        result.AddRange(scanResult);

        return result;
    }
}
