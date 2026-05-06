using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        // TODO: Integrate with SendGrid, Mailgun, or SES for production
        _logger.LogInformation("Email would be sent to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendVerificationEmailAsync(string to, string token, CancellationToken cancellationToken = default)
    {
        var body = $"<p>Click <a href='http://localhost:3000/verify-email?token={token}'>here</a> to verify your email.</p>";
        return SendEmailAsync(to, "Verify your email", body, cancellationToken);
    }

    public Task SendPasswordResetEmailAsync(string to, string token, CancellationToken cancellationToken = default)
    {
        var body = $"<p>Click <a href='http://localhost:3000/reset-password?email={to}&token={token}'>here</a> to reset your password.</p>";
        return SendEmailAsync(to, "Reset your password", body, cancellationToken);
    }
}
