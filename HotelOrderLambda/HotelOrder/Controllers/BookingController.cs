﻿using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using AutoMapper;
using HotelOrder.Dtos;
using HotelOrder.Models;
using HotelOrder.Requests;
using HotelOrder.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HotelOrder.Controllers;

[Authorize(Roles = "Member")]
[Route("[controller]")]
[ApiController]
public class BookingController : ControllerBase {
    
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpGet]
    public async Task<IActionResult> Get([FromServices] IConfiguration configuration, ICognitoAuthority cognitoAuthority) {
        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        string? userId = await cognitoAuthority.GetUserId(User, Request);

        if (userId is null) {
            var error = new { Error = "User not found" };
            return BadRequest(error);
        }

        var conditions = new List<ScanCondition>
        {
            new ScanCondition("UserId", ScanOperator.Equal, userId)
        };

        var result = new List<BookingDto>();
        var scanResult = await dbContext.ScanAsync<BookingDto>(conditions).GetRemainingAsync();
        result.AddRange(scanResult);

        await Parallel.ForEachAsync(result, async (booking, cToken) =>
        {
            var hotelId = booking.HotelId;

            var hotelConditions = new List<ScanCondition>
            {
                new ScanCondition("Id", ScanOperator.Equal, hotelId)
            };
            var matchingHotel = await dbContext.ScanAsync<Hotel>(hotelConditions).GetRemainingAsync();
            booking.HotelName = matchingHotel.FirstOrDefault()?.Name ?? "";
            booking.HotelRating = matchingHotel.FirstOrDefault()?.Rating ?? 0;
            booking.HotelCity = matchingHotel.FirstOrDefault()?.City ?? "";
            booking.HotelPrice = matchingHotel.FirstOrDefault()?.Price ?? 0;
            booking.HotelFileName = matchingHotel.FirstOrDefault()?.FileName ?? "";
        });

        var options = new JsonSerializerOptions {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return Ok(JsonSerializer.Serialize(new { Bookings = result }, options));
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromServices] IConfiguration configuration, ICognitoAuthority cognitoAuthority, string id) {
        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        string? userId = await cognitoAuthority.GetUserId(User, Request);

        if (userId is null) {
            var error = new { Error = "User not found" };
            return BadRequest(error);
        }

        var conditions = new List<ScanCondition>
        {
            new ScanCondition("UserId", ScanOperator.Equal, userId),
            new ScanCondition("Id", ScanOperator.Equal, id)
        };
        
        var scanResult = await dbContext.ScanAsync<BookingDto>(conditions).GetRemainingAsync();
        var result = scanResult.FirstOrDefault();

        if (result != null) {
            var hotelId = result.HotelId;

            var hotelConditions = new List<ScanCondition>
            {
            new ScanCondition("Id", ScanOperator.Equal, hotelId)
        };
            var matchingHotel = await dbContext.ScanAsync<Hotel>(hotelConditions).GetRemainingAsync();
            result.HotelName = matchingHotel.FirstOrDefault()?.Name ?? "";
            result.HotelRating = matchingHotel.FirstOrDefault()?.Rating ?? 0;
            result.HotelCity = matchingHotel.FirstOrDefault()?.City ?? "";
            result.HotelPrice = matchingHotel.FirstOrDefault()?.Price ?? 0;
            result.HotelFileName = matchingHotel.FirstOrDefault()?.FileName ?? "";
        }

        var options = new JsonSerializerOptions {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return Ok(JsonSerializer.Serialize(new { Booking = result }, options));
    }

    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpPost]
    public async Task<IActionResult> Post(
        [FromServices] IConfiguration configuration, 
        ICognitoAuthority cognitoAuthority, 
        [FromBody] NewBookingRequest newBooking) {

        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var validate = newBooking.Validate();
        if (validate.IsValid == false) {
            var error = new { Error = validate.ErrorMessage };
            return BadRequest(error);
        }

        string? userId = await cognitoAuthority.GetUserId(User, Request);

        if (userId is null) {
            var error = new { Error = "User not found" };
            return BadRequest(error);
        } 

        var mapperConfig = new MapperConfiguration(cfg =>
                cfg.CreateMap<NewBookingRequest, Booking>()
                    .ForMember(dest => dest.Id,
                        opt => opt.MapFrom(src => Guid.NewGuid().ToString()))
                    .ForMember(dest => dest.UserId,
                        opt => opt.MapFrom(src => userId))
                    .ForMember(dest => dest.CheckIn,
                        opt => opt.MapFrom(src => DateTime.Parse(src.CheckIn!)))
                    .ForMember(dest => dest.CheckOut,
                        opt => opt.MapFrom(src => DateTime.Parse(src.CheckOut!)))
                    .ForMember(dest => dest.Status,
                        opt => opt.MapFrom(src => BookingStatus.Pending))
                    .ForMember(dest => dest.CreationDateTime,
                        opt => opt.MapFrom(src => DateTime.Now))
                    .ForMember(dest => dest.ModifiedDateTime,
                        opt => opt.MapFrom(src => DateTime.Now))
            );

        var mapper = new Mapper(mapperConfig);

        var booking = mapper.Map<NewBookingRequest, Booking>(newBooking);

        await dbContext.SaveAsync(booking);

        return CreatedAtAction(nameof(Get), new { id = booking.Id }, newBooking);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HttpPut()]
    public async Task<IActionResult> Put([FromServices] IConfiguration configuration, ICognitoAuthority cognitoAuthority, [FromBody] UpdateBookingRequest bookingRequest) {

        var region = configuration["AppSettings:DynamoDB:AWSRegion"];
        using var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        using var dbContext = new DynamoDBContext(dbClient);

        var validate = bookingRequest.Validate();
        if (validate.IsValid == false) {
            var error = new { Error = validate.ErrorMessage };
            return BadRequest(error);
        }

        string? userId = await cognitoAuthority.GetUserId(User, Request);

        if (userId is null) {
            var error = new { Error = "User not found" };
            return BadRequest(error);
        }

        if (bookingRequest.UserId != userId) {
            var error = new { Error = "User not authorized" };
            return BadRequest(error);
        }

        string id = bookingRequest.Id;

        var bookingToUpdate = await dbContext.LoadAsync<Booking>(userId, id);

        if (bookingToUpdate is null) {
            var error = new { Error = "Booking not found" };
            return NotFound(error);
        }

        bookingToUpdate.CheckIn = DateTime.Parse(bookingRequest.CheckIn!);
        bookingToUpdate.CheckOut = DateTime.Parse(bookingRequest.CheckOut!);

        await dbContext.SaveAsync(bookingToUpdate);

        return Ok();

    }
}
