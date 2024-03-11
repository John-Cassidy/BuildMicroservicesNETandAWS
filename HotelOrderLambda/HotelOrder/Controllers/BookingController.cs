using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Runtime.Internal;
using HotelOrder.Models;
using HotelOrder.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace HotelOrder.Controllers;

[Route("[controller]")]
[ApiController]
public class BookingController : ControllerBase
{
    //[Authorize(Roles = "Member")]
    // add Response Type IEnumerable<Booking>
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpGet]
    public async Task<IActionResult> Get([FromServices] IConfiguration configuration, ICognitoAuthority cognitoAuthority)
    {
        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        string? userId = await cognitoAuthority.GetUserId(User, Request);

        if (userId is null) {
            var error = new { Error = "User not found" };
            return BadRequest(error);
        }

        var result = new List<Booking>();
        var scanResult = await dbContext.ScanAsync<Booking>(new List<ScanCondition>()).GetRemainingAsync();
        result.AddRange(scanResult);

        return Ok(result);
    }
}
