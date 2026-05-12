using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NewsletterController : ControllerBase
{
    private readonly ILogger<NewsletterController> _logger;

    public NewsletterController(ILogger<NewsletterController> logger)
    {
        _logger = logger;
    }

    [HttpPost("subscribe")]
    public IActionResult Subscribe([FromBody] NewsletterSubscribeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { success = false, message = "Email is required." });

        _logger.LogInformation("Newsletter subscription: {Email}", request.Email);
        return Ok(new { success = true, message = "Successfully subscribed to newsletter!" });
    }
}

public record NewsletterSubscribeRequest(string Email);
