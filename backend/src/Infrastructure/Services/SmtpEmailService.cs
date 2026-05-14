using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly IConfiguration _configuration;

    public SmtpEmailService(ILogger<SmtpEmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = _configuration.GetValue<int>("Email:SmtpPort");
        var smtpUsername = _configuration["Email:SmtpUsername"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@shophub.com";
        var fromName = _configuration["Email:FromName"] ?? "ShopHub";

        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogInformation("SMTP not configured. Email would be sent to {To}: {Subject}", to, subject);
            return;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
            throw;
        }
    }

    public Task SendVerificationEmailAsync(string to, string token, CancellationToken cancellationToken = default)
    {
        var body = $"<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
            + $"<h2 style='color: #333;'>Verify Your Email</h2>"
            + $"<p>Thank you for registering! Please click the button below to verify your email address:</p>"
            + $"<a href='http://localhost:3000/verify-email?token={token}' "
            + $"style='display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;'>Verify Email</a>"
            + $"<p style='color: #666; font-size: 12px;'>This link expires in 24 hours.</p>"
            + $"<p style='color: #666; font-size: 12px;'>If you didn't create an account, you can safely ignore this email.</p>"
            + $"</div>";
        return SendEmailAsync(to, "Verify your email address", body, cancellationToken);
    }

    public Task SendPasswordResetEmailAsync(string to, string token, CancellationToken cancellationToken = default)
    {
        var body = $"<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
            + $"<h2 style='color: #333;'>Reset Your Password</h2>"
            + $"<p>You requested a password reset. Click the button below to reset your password:</p>"
            + $"<a href='http://localhost:3000/reset-password?email={to}&token={token}' "
            + $"style='display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;'>Reset Password</a>"
            + $"<p style='color: #666; font-size: 12px;'>This link expires in 1 hour.</p>"
            + $"<p style='color: #666; font-size: 12px;'>If you didn't request this, you can safely ignore this email.</p>"
            + $"</div>";
        return SendEmailAsync(to, "Reset your password", body, cancellationToken);
    }
}
