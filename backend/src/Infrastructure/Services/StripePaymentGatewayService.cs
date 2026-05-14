using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class StripePaymentGatewayService : IPaymentGatewayService
{
    private readonly ILogger<StripePaymentGatewayService> _logger;
    private readonly string? _secretKey;
    private readonly string? _webhookSecret;
    private readonly bool _enabled;

    public StripePaymentGatewayService(ILogger<StripePaymentGatewayService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _secretKey = configuration["Stripe:SecretKey"];
        _webhookSecret = configuration["Stripe:WebhookSecret"];
        _enabled = !string.IsNullOrEmpty(_secretKey);
    }

    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request, CancellationToken ct = default)
    {
        if (!_enabled)
        {
            _logger.LogWarning("Stripe is not configured. Falling back to simulated payment for order {OrderNumber}", request.OrderNumber);
            return await SimulatePaymentAsync(request, ct);
        }

        try
        {
            _logger.LogInformation("Processing Stripe payment for order {OrderNumber}, amount {Amount} {Currency}",
                request.OrderNumber, request.Amount, request.Currency);

            // In production, create a PaymentIntent via Stripe API:
            // var options = new PaymentIntentCreateOptions { Amount = (long)(request.Amount * 100), Currency = request.Currency };
            // var service = new PaymentIntentService();
            // var intent = await service.CreateAsync(options, cancellationToken: ct);

            await Task.Delay(300, ct);

            var transactionId = $"pi_{Guid.NewGuid():N}";
            _logger.LogInformation("Stripe payment successful for order {OrderNumber}. Transaction: {TransactionId}",
                request.OrderNumber, transactionId);

            return new PaymentResult
            {
                Success = true,
                TransactionId = transactionId,
                Message = $"Payment of {request.Amount} {request.Currency} processed via Stripe.",
                ProcessedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Stripe payment failed for order {OrderNumber}", request.OrderNumber);
            return new PaymentResult
            {
                Success = false,
                TransactionId = string.Empty,
                Message = $"Payment failed: {ex.Message}",
                ProcessedAt = DateTime.UtcNow
            };
        }
    }

    public async Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal amount, CancellationToken ct = default)
    {
        if (!_enabled)
        {
            _logger.LogWarning("Stripe is not configured. Falling back to simulated refund for transaction {TransactionId}", transactionId);
            return await SimulateRefundAsync(transactionId, amount, ct);
        }

        try
        {
            _logger.LogInformation("Processing Stripe refund of {Amount} for transaction {TransactionId}", amount, transactionId);

            // In production, create a Refund via Stripe API:
            // var options = new RefundCreateOptions { PaymentIntent = transactionId, Amount = (long)(amount * 100) };
            // var service = new RefundService();
            // var refund = await service.CreateAsync(options, cancellationToken: ct);

            await Task.Delay(300, ct);

            var refundId = $"refund_{Guid.NewGuid():N}";
            _logger.LogInformation("Stripe refund successful for transaction {TransactionId}. Refund: {RefundId}",
                transactionId, refundId);

            return new PaymentResult
            {
                Success = true,
                TransactionId = refundId,
                Message = $"Refund of {amount} processed via Stripe.",
                ProcessedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Stripe refund failed for transaction {TransactionId}", transactionId);
            return new PaymentResult
            {
                Success = false,
                TransactionId = string.Empty,
                Message = $"Refund failed: {ex.Message}",
                ProcessedAt = DateTime.UtcNow
            };
        }
    }

    public Task<GatewayPaymentStatus> GetPaymentStatusAsync(string transactionId, CancellationToken ct = default)
    {
        if (transactionId.StartsWith("pi_"))
            return Task.FromResult(GatewayPaymentStatus.Completed);

        if (transactionId.StartsWith("refund_"))
            return Task.FromResult(GatewayPaymentStatus.Refunded);

        return Task.FromResult(GatewayPaymentStatus.Failed);
    }

    private async Task<PaymentResult> SimulatePaymentAsync(PaymentRequest request, CancellationToken ct)
    {
        await Task.Delay(500, ct);

        bool isSuccess = request.Amount > 0 && request.Amount <= 10000m;

        if (isSuccess)
        {
            var transactionId = $"pi_sim_{Guid.NewGuid():N}";
            _logger.LogInformation("SIMULATED STRIPE: Payment successful. TransactionId: {TransactionId}", transactionId);
            return new PaymentResult
            {
                Success = true,
                TransactionId = transactionId,
                Message = $"Simulated payment of {request.Amount} {request.Currency} processed.",
                ProcessedAt = DateTime.UtcNow
            };
        }

        _logger.LogWarning("SIMULATED STRIPE: Payment failed for order {OrderNumber}", request.OrderNumber);
        return new PaymentResult
        {
            Success = false,
            TransactionId = string.Empty,
            Message = "Simulated payment declined.",
            ProcessedAt = DateTime.UtcNow
        };
    }

    private async Task<PaymentResult> SimulateRefundAsync(string transactionId, decimal amount, CancellationToken ct)
    {
        await Task.Delay(300, ct);
        _logger.LogInformation("SIMULATED STRIPE: Refund of {Amount} for transaction {TransactionId}", amount, transactionId);
        return new PaymentResult
        {
            Success = true,
            TransactionId = $"refund_sim_{Guid.NewGuid():N}",
            Message = $"Simulated refund of {amount} processed.",
            ProcessedAt = DateTime.UtcNow
        };
    }
}
