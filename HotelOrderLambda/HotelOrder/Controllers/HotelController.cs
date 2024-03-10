﻿using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Amazon;
using HotelOrder.Models;

namespace HotelOrder.Controllers;
[Route("[controller]")]
[ApiController]
public class HotelController : ControllerBase {

    [Authorize(Roles = "Admin,HotelManager,Member")]
    [HttpGet]    
    public async Task<IEnumerable<Hotel>> Get([FromServices] IConfiguration configuration) {
        var region =configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var result = new List<Hotel>();
        var scanResult = await dbContext.ScanAsync<Hotel>(new List<ScanCondition>()).GetRemainingAsync();
        result.AddRange(scanResult);

        return result;
    }
}
