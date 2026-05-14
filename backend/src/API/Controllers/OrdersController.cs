using Application.Features.Orders.Commands;
using Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetUserOrdersQuery(pageNumber, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderQuery(id), ct);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CancelOrderCommand(id), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
