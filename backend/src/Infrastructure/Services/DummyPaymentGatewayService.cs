using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class DummyPaymentGatewayService : IPaymentGatewayService
{
    private readonly ILogger<DummyPaymentGatewayService> _logger;

    public DummyPaymentGatewayService(ILogger<DummyPaymentGatewayService> logger)
    {
        _logger = logger;
    }

    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "DUMMY PAYMENT: Processing payment for order {OrderNumber}, amount {Amount} {Currency}, method {Method}, wallet {WalletId}",
            request.OrderNumber, request.Amount, request.Currency, request.PaymentMethod, request.WalletId);

        await Task.Delay(500, ct);

        bool isSuccess = request.Amount > 0 && request.Amount <= 10000m;

        if (isSuccess)
        {
            var transactionId = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100000, 999999)}";

            _logger.LogInformation("DUMMY PAYMENT: Payment successful. TransactionId: {TransactionId}", transactionId);

            return new PaymentResult
            {
                Success = true,
                TransactionId = transactionId,
                Message = $"Payment of {request.Amount} {request.Currency} processed successfully via {request.PaymentMethod}.",
                ProcessedAt = DateTime.UtcNow
            };
        }

        _logger.LogWarning("DUMMY PAYMENT: Payment failed for order {OrderNumber}. Amount: {Amount}",
            request.OrderNumber, request.Amount);

        return new PaymentResult
        {
            Success = false,
            TransactionId = string.Empty,
            Message = "Payment declined. Amount must be between 0 and 10,000.",
            ProcessedAt = DateTime.UtcNow
        };
    }

    public async Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal amount, CancellationToken ct = default)
    {
        _logger.LogInformation("DUMMY REFUND: Refunding {Amount} for transaction {TransactionId}", amount, transactionId);

        await Task.Delay(300, ct);

        return new PaymentResult
        {
            Success = true,
            TransactionId = $"REFUND-{transactionId}",
            Message = $"Refund of {amount} processed successfully.",
            ProcessedAt = DateTime.UtcNow
        };
    }

    public async Task<GatewayPaymentStatus> GetPaymentStatusAsync(string transactionId, CancellationToken ct = default)
    {
        _logger.LogInformation("DUMMY STATUS: Checking status for transaction {TransactionId}", transactionId);

        await Task.CompletedTask;

        if (transactionId.StartsWith("TXN-"))
            return GatewayPaymentStatus.Completed;

        if (transactionId.StartsWith("REFUND-"))
            return GatewayPaymentStatus.Refunded;

        return GatewayPaymentStatus.Failed;
    }
}
