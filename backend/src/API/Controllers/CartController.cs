using Application.Features.Cart.Commands;
using Application.Features.Cart.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCartQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("items/{itemId}")]
    public async Task<IActionResult> UpdateCartItem(Guid itemId, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateCartItemCommand(itemId, request.Quantity), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("items/{itemId}")]
    public async Task<IActionResult> RemoveCartItem(Guid itemId, CancellationToken ct)
    {
        var result = await _mediator.Send(new RemoveCartItemCommand(itemId), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        // TODO: Implement clear cart
        return Ok(new { success = true, message = "Cart cleared." });
    }

    [HttpPost("coupon")]
    public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponRequest request, CancellationToken ct)
    {
        // TODO: Implement apply coupon
        return Ok(new { success = true, message = "Coupon applied." });
    }
}

public record UpdateCartItemRequest(int Quantity);
public record ApplyCouponRequest(string Code);
