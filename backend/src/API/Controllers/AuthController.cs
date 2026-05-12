using Application.Features.Auth.Commands;
using Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;

    public AuthController(IMediator mediator, IWebHostEnvironment env)
    {
        _mediator = mediator;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var result = await _mediator.Send(new LogoutCommand(), ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("profile/image")]
    [Authorize]
    public async Task<IActionResult> UploadProfileImage(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "No file uploaded." });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { success = false, message = "Invalid file type." });

        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { success = false, message = "File size exceeds 2MB limit." });

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "profiles");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        var url = $"/uploads/profiles/{fileName}";
        return Ok(new { success = true, data = new { url } });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var user = await _mediator.Send(new GetCurrentUserQuery(), ct);
        return Ok(new { success = true, data = user });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, CancellationToken ct)
    {
        // TODO: Implement email verification handler
        return Ok(new { success = true, message = "Email verified successfully." });
    }
}
