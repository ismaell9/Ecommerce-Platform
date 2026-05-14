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

        // Validate card details if payment method is card
        if (request.PaymentMethod == "card")
        {
            if (string.IsNullOrWhiteSpace(request.CardholderName) ||
                string.IsNullOrWhiteSpace(request.CardNumber) ||
                string.IsNullOrWhiteSpace(request.ExpiryDate) ||
                string.IsNullOrWhiteSpace(request.CVV))
            {
                _logger.LogWarning("DUMMY PAYMENT: Card payment failed for order {OrderNumber}. Missing card details.",
                    request.OrderNumber);

                return new PaymentResult
                {
                    Success = false,
                    TransactionId = string.Empty,
                    Message = "Invalid card details. Please provide all required card information.",
                    ProcessedAt = DateTime.UtcNow
                };
            }

            // Validate card number (basic check - should be 13-19 digits)
            if (request.CardNumber.Length < 13 || request.CardNumber.Length > 19 || !request.CardNumber.All(char.IsDigit))
            {
                _logger.LogWarning("DUMMY PAYMENT: Card payment failed for order {OrderNumber}. Invalid card number format.",
                    request.OrderNumber);

                return new PaymentResult
                {
                    Success = false,
                    TransactionId = string.Empty,
                    Message = "Invalid card number. Please check and try again.",
                    ProcessedAt = DateTime.UtcNow
                };
            }

            // Validate expiry date format (MM/YY)
            if (!request.ExpiryDate.Contains("/") || request.ExpiryDate.Length != 5)
            {
                _logger.LogWarning("DUMMY PAYMENT: Card payment failed for order {OrderNumber}. Invalid expiry date format.",
                    request.OrderNumber);

                return new PaymentResult
                {
                    Success = false,
                    TransactionId = string.Empty,
                    Message = "Invalid expiry date format. Use MM/YY format.",
                    ProcessedAt = DateTime.UtcNow
                };
            }

            // Validate CVV (3-4 digits)
            if (request.CVV.Length < 3 || request.CVV.Length > 4 || !request.CVV.All(char.IsDigit))
            {
                _logger.LogWarning("DUMMY PAYMENT: Card payment failed for order {OrderNumber}. Invalid CVV.",
                    request.OrderNumber);

                return new PaymentResult
                {
                    Success = false,
                    TransactionId = string.Empty,
                    Message = "Invalid CVV. Please check and try again.",
                    ProcessedAt = DateTime.UtcNow
                };
            }

            _logger.LogInformation(
                "DUMMY PAYMENT: Card validation passed for order {OrderNumber}. Card: **** **** **** {CardLast4}",
                request.OrderNumber, request.CardNumber[^4..]);
        }

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
