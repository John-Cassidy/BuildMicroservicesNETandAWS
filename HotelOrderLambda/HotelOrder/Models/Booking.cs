using Amazon.DynamoDBv2.DataModel;

namespace HotelOrder.Models;

[DynamoDBTable("HotelsOrder_Bookings")]
public class Booking {
    [DynamoDBHashKey("UserId")] public string? UserId { get; set; }

    [DynamoDBRangeKey("Id")] public string? Id { get; set; }

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }

    public string? HotelId { get; set; }

    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }

    public DateTime CreationDateTime { get; set; }
    public DateTime ModifiedDateTime { get; set; }
}
