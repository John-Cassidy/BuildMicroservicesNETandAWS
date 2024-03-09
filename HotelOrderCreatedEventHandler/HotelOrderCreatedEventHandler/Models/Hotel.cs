using Amazon.DynamoDBv2.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelOrderCreatedEventHandler.Models;

[DynamoDBTable("HotelsOrder_Hotels")]
public class Hotel {
    [DynamoDBHashKey("UserId")] public string? UserId { get; set; }

    [DynamoDBRangeKey("Id")] public string? Id { get; set; }

    public string? Constant { get; set; }

    public string? Name { get; set; }
    public int Rating { get; set; }
    public string? City { get; set; }
    public int Price { get; set; }
    public string? FileName { get; set; }

    public DateTime CreationDateTime { get; set; }
}
