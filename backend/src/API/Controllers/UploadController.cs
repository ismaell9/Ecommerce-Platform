using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("product-image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadProductImage(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest("Invalid file type. Allowed: jpg, jpeg, png, gif, webp");

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File size exceeds 5MB limit.");

        var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        var url = $"/uploads/products/{fileName}";
        return Ok(new { success = true, url });
    }

    [HttpDelete("product-image")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteProductImage([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest("URL is required.");

        var fileName = Path.GetFileName(url);
        var filePath = Path.Combine(_env.WebRootPath, "uploads", "products", fileName);

        if (!System.IO.File.Exists(filePath))
            return NotFound("File not found.");

        System.IO.File.Delete(filePath);
        return Ok(new { success = true, message = "Image deleted." });
    }
}
