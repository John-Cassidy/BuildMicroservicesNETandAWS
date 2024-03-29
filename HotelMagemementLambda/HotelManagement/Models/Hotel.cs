﻿using Amazon.DynamoDBv2.DataModel;

namespace HotelManagement.Models;

[DynamoDBTable("HotelsAdmin_Hotels")]
public class Hotel
{
    [DynamoDBHashKey("UserId")]
    public string? UserId { get; set; }

    [DynamoDBRangeKey("Id")]
    public string? Id { get; set; }
    public string? Name { get; set; }
    public int Rating { get; set; }
    public string? City { get; set; }
    public int Price { get; set; }
    public string? FileName { get; set; }

}
