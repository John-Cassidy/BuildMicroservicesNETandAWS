using HotelOrder.Models;

namespace HotelOrder.Dtos;

public class BookingDto : Booking {
    public string? HotelName { get; set; }
    public int HotelRating { get; set; }
    public string? HotelCity { get; set; }
    public int HotelPrice { get; set; }
    public string? HotelFileName { get; set; }
}
