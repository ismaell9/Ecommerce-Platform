using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentGateway;

    public PaymentsController(IPaymentGatewayService paymentGateway)
    {
        _paymentGateway = paymentGateway;
    }

    [HttpPost("refund")]
    public async Task<IActionResult> RefundPayment(
        [FromBody] RefundRequest request,
        CancellationToken ct)
    {
        var result = await _paymentGateway.RefundPaymentAsync(request.TransactionId, request.Amount, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{transactionId}/status")]
    public async Task<IActionResult> GetPaymentStatus(string transactionId, CancellationToken ct)
    {
        var status = await _paymentGateway.GetPaymentStatusAsync(transactionId, ct);
        return Ok(new { transactionId, status = status.ToString() });
    }
}

public record RefundRequest(string TransactionId, decimal Amount);
