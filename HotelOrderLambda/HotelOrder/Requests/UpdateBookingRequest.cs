using Amazon.DynamoDBv2.DataModel;
using System.Text;

namespace HotelOrder.Requests;

public class UpdateBookingRequest {

    public required string UserId { get; set; }
    public required string Id { get; set; }
    public required string HotelId { get; set; }

    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }

    public (bool IsValid, string ErrorMessage) Validate() {
        StringBuilder sb = new StringBuilder();        

        if (string.IsNullOrEmpty(this.CheckIn)) {
            sb.Append("[CheckIn] is required.\n");
        } else if (!DateTime.TryParse(this.CheckIn, out _)) {
            sb.Append("[CheckIn] is not a valid date.\n");
        }

        if (string.IsNullOrEmpty(this.CheckOut)) {
            sb.Append("[CheckOut] is required.\n");
        } else if (!DateTime.TryParse(this.CheckOut, out _)) {
            sb.Append("[CheckOut] is not a valid date.\n");
        }

        if (ValidateCheckInCheckOutDates().IsValid == false) {
            sb.Append(ValidateCheckInCheckOutDates().ErrorMessage);
        }

        return (sb.Length == 0, sb.ToString());
    }

    public (bool IsValid, string ErrorMessage) ValidateCheckInCheckOutDates() {
        StringBuilder sb = new StringBuilder();

        DateTime checkInDate;
        DateTime checkOutDate;

        if (DateTime.TryParse(this.CheckIn, out checkInDate) && DateTime.TryParse(this.CheckOut, out checkOutDate)) {
            if (checkInDate >= checkOutDate) {
                sb.Append("[CheckIn] must be before [CheckOut].\n");
            }
        }

        return (sb.Length == 0, sb.ToString());
    }
}
