using Application.Features.Wishlist.Commands;
using Application.Features.Wishlist.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IMediator _mediator;

    public WishlistController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetWishlist(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetWishlistQuery(), ct);
        return Ok(new { success = true, data = result });
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToWishlist(Guid productId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ToggleWishlistCommand(productId), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId, CancellationToken ct)
    {
        var result = await _mediator.Send(new RemoveFromWishlistCommand(productId), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("toggle/{productId}")]
    public async Task<IActionResult> ToggleWishlist(Guid productId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ToggleWishlistCommand(productId), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
