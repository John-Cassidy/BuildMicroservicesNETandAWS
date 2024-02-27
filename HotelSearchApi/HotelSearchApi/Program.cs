using System.Net;
using HotelSearchApi.Models;
using OpenSearch.Client;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/search", async (HttpContext context, IConfiguration config, string? city, int? rating = 1) =>
{
    var result = new HttpResponseMessage(HttpStatusCode.OK);
    result.Content = new StringContent($"Searching for hotels in {city} with rating {rating}");
    return await SearchHotels(config, city, rating);
});

async Task<List<Hotel>> SearchHotels(IConfiguration config, string? city, int? rating)
{
    string domainEndpoint = config["AppSettings:ElasticSearch:DomainEndpoint"]!;
    string username = config["AppSettings:ElasticSearch:Username"]!;
    string password = config["AppSettings:ElasticSearch:Password"]!;
    string indexName = config["AppSettings:ElasticSearch:IndexName"]!;

    var connectionSettings = new ConnectionSettings(new Uri(domainEndpoint))
        .BasicAuthentication(username, password)
        .DefaultIndex(indexName)
        .DefaultMappingFor<Hotel>(m => m.IdProperty(p => p.Id));

    var client = new OpenSearchClient(connectionSettings);

    rating ??= 1;

    // Match 
    // Prefix 
    // Range
    // Fuzzy Match

    ISearchResponse<Hotel> result;

    if (city is null)
        result = await client.SearchAsync<Hotel>(s => s.Query(q =>
            q.MatchAll() &&
            q.Range(r => r.Field(f => f.Rating).GreaterThanOrEquals(rating))
        ));
    else
        result = await client.SearchAsync<Hotel>(s =>
            s.Query(q =>
                q.Prefix(p => p.Field(f => f.City).Value(city).CaseInsensitive())
                &&
                q.Range(r => r.Field(f => f.Rating).GreaterThanOrEquals(rating))
            )
        );

    var results = result.Hits.Select(x => x.Source).ToList();
    return results;
}

app.Run();
