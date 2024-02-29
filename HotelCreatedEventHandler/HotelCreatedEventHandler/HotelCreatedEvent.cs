using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.Lambda.SNSEvents;
using System.Text.Json;
using Amazon.DynamoDBv2.DocumentModel;
using HotelCreatedEventHandler.Models;
using Microsoft.Extensions.Configuration;
using Amazon;

[assembly: LambdaSerializer(typeof(DefaultLambdaJsonSerializer))]

namespace HotelCreatedEventHandler;

public class HotelCreatedEvent
{
    private readonly IConfigurationRoot _configurations;

    public HotelCreatedEvent()
    {
        _configurations = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();
    }

    public async Task FunctionHandler(SNSEvent snsEvent, ILambdaContext context)
    {
        var region = Environment.GetEnvironmentVariable("AWS_REGION");
        var dbClient = new AmazonDynamoDBClient(RegionEndpoint.GetBySystemName(region));
        var eventTable = Table.LoadTable(dbClient, "hotel-created-event-ids");
        
        using var dbContext = new DynamoDBContext(dbClient);

        foreach (var eventRecord in snsEvent.Records)
        {
            var eventId = eventRecord.Sns.MessageId;
            var foundItem = await eventTable.GetItemAsync(eventId);
            if (foundItem == null)
            {
                await eventTable.PutItemAsync(new Document
                {
                    ["eventId"] = eventId
                });
            }

            var hotel = JsonSerializer.Deserialize<Hotel>(eventRecord.Sns.Message);
            await dbContext.SaveAsync(hotel);

            context.Logger.LogInformation($"Processed record {eventRecord.Sns.Message}");
        }

        await Task.CompletedTask;
    }
}