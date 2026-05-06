using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        context.Response.StatusCode = exception switch
        {
            Domain.Exceptions.NotFoundException => 404,
            Domain.Exceptions.BadRequestException => 400,
            UnauthorizedAccessException => 401,
            FluentValidation.ValidationException => 422,
            _ => 500
        };

        var message = _env.IsDevelopment() ? exception.Message : "An unexpected error occurred.";

        object response = exception switch
        {
            FluentValidation.ValidationException ex => new
            {
                success = false,
                message = "Validation failed",
                errors = ex.Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            },
            _ => new
            {
                success = false,
                message = exception is Domain.Exceptions.NotFoundException or Domain.Exceptions.BadRequestException
                    ? exception.Message
                    : message,
                details = _env.IsDevelopment() ? exception.StackTrace : null
            }
        };

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
}
