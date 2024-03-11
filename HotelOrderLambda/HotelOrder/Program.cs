using HotelOrder.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// read configurations
string cognitoAppClientId = builder.Configuration["AppSettings:Cognito:AppClientId"].ToString();
string cognitoUserPoolId = builder.Configuration["AppSettings:Cognito:UserPoolId"].ToString();
string cognitoAWSRegion = builder.Configuration["AppSettings:Cognito:AWSRegion"].ToString();

string validIssuer = $"https://cognito-idp.{cognitoAWSRegion}.amazonaws.com/{cognitoUserPoolId}";
string validAudience = cognitoAppClientId;

// Add services to the container.
builder.Services.AddControllers();

// Add AWS Lambda support. When application is run in Lambda Kestrel is swapped out as the web server with Amazon.Lambda.AspNetCoreServer. This
// package will act as the webserver translating request and responses between the Lambda event source and ASP.NET Core.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

// Configure CORS
builder.Services.AddCors(item => {
    item.AddPolicy("CORSPolicy", builder => {
        builder.WithOrigins("*")
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

// Register authentication schemes, and specify the default authentication scheme
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options => {
        options.Authority = validIssuer;
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateLifetime = true,
            ValidAudience = validAudience,
            ValidateAudience = true,
            RoleClaimType = "cognito:groups"
        };
    });

builder.Services.AddScoped<ICognitoAuthority, CognitoAuthority>();


var app = builder.Build();

app.UsePathBase("/hotel-order");
app.UseRouting();

app.UseHttpsRedirection();

app.UseCors("CORSPolicy");

app.UseAuthorization();
app.MapControllers();

app.Run();
