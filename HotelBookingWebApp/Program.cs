var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

// app.MapGet("/", () => "Hello World!");

app.MapFallback(async context =>
        {
            context.Response.ContentType = "text/html";
            await context.Response.WriteAsync(File.ReadAllText(Path.Combine(app.Environment.ContentRootPath, "wwwroot", "index.html")));
        });

app.Run();
