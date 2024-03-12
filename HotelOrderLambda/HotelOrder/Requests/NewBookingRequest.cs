using System.Text;

namespace HotelOrder.Requests;

public class NewBookingRequest {
    
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }

    public string? HotelId { get; set; }

    public string? CheckIn { get; set; }
    public string? CheckOut { get; set; }

    public (bool IsValid, string ErrorMessage) Validate() {
        StringBuilder sb = new StringBuilder();

        if (string.IsNullOrEmpty(this.FirstName)) {
            sb.Append("[FirstName] is required.\n");
        }

        if (string.IsNullOrEmpty(this.LastName)) {
            sb.Append("[LastName] is required.\n");
        }

        if (string.IsNullOrEmpty(this.Email)) {
            sb.Append("[Email] is required.\n");
        }

        if (string.IsNullOrEmpty(this.Address)) {
            sb.Append("[Address] is required.\n");
        }

        if (string.IsNullOrEmpty(this.HotelId)) {
            sb.Append("[HotelId] is required.\n");
        }

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
