namespace Application.Interfaces;

public interface IPaymentGatewayService
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request, CancellationToken ct = default);
    Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal amount, CancellationToken ct = default);
    Task<GatewayPaymentStatus> GetPaymentStatusAsync(string transactionId, CancellationToken ct = default);
}

public class PaymentRequest
{
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentMethod { get; set; } = string.Empty;
    public string? WalletId { get; set; }
    public string? Description { get; set; }
}

public class PaymentResult
{
    public bool Success { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}

public enum GatewayPaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}
