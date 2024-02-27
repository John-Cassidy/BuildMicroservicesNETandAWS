using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.Lambda.SNSEvents;
using System.Text.Json;
using Amazon.DynamoDBv2.DocumentModel;
using HotelCreatedEventHandler.Models;
using Microsoft.Extensions.Configuration;
using OpenSearch.Client;

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
        var dbClient = new AmazonDynamoDBClient();
        var table = Table.LoadTable(dbClient, "hotel-created-event-ids");

        string domainEndpoint = _configurations["AppSettings:ElasticSearch:DomainEndpoint"];
        string username = _configurations["AppSettings:ElasticSearch:Username"];
        string password = _configurations["AppSettings:ElasticSearch:Password"];
        string indexName = _configurations["AppSettings:ElasticSearch:IndexName"];

        var connectionSettings = new ConnectionSettings(new Uri(domainEndpoint))
            .BasicAuthentication(username, password)
            .DefaultIndex(indexName)
            .DefaultMappingFor<Hotel>(m => m.IdProperty(p => p.Id));

        var esClient = new OpenSearchClient(connectionSettings);

        if (!(await esClient.Indices.ExistsAsync(indexName)).Exists)
        {
            await esClient.Indices.CreateAsync(indexName);
        }

        foreach (var eventRecord in snsEvent.Records)
        {

            var eventId = eventRecord.Sns.MessageId;
            var foundItem = await table.GetItemAsync(eventId);
            if (foundItem == null)
            {
                await table.PutItemAsync(new Document
                {
                    ["eventId"] = eventId
                });
            }

            var hotel = JsonSerializer.Deserialize<Hotel>(eventRecord.Sns.Message);
            await esClient.IndexDocumentAsync<Hotel>(hotel!);

            context.Logger.LogInformation($"Processed record {eventRecord.Sns.Message}");
        }

        await Task.CompletedTask;
    }
}