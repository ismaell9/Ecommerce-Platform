using Application.Common;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using MediatR;
using CartEntity = Domain.Entities.Cart;
using WishlistEntity = Domain.Entities.Wishlist;

namespace Application.Features.Auth.Commands;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber) : IRequest<Result<AuthResponseDto>>;

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _context.Users.ExistsAsync(
            u => u.Email == request.Email, cancellationToken);

        if (emailExists)
            return Result<AuthResponseDto>.FailureResult("Email is already registered.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            PhoneNumber = request.PhoneNumber,
            EmailVerificationToken = _tokenService.GenerateEmailVerificationToken(),
            EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
            IsActive = true
        };

        await _context.Users.AddAsync(user, cancellationToken);

        var customerRole = (await _context.Roles
            .GetByExpressionAsync(r => r.Name == "Customer", cancellationToken)).FirstOrDefault();

        if (customerRole != null)
        {
            var userRole = new UserRole { UserId = user.Id, RoleId = customerRole.Id };
            // Attach directly via context
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            await _context.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Create cart and wishlist for the user
        var cart = new CartEntity { Id = Guid.NewGuid(), UserId = user.Id };
        var wishlist = new WishlistEntity { Id = Guid.NewGuid(), UserId = user.Id };
        await _context.Carts.AddAsync(cart, cancellationToken);
        await _context.Wishlists.AddAsync(wishlist, cancellationToken);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        var tokens = GenerateTokens(user);

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendVerificationEmailAsync(
                    user.Email, user.EmailVerificationToken!, cancellationToken);
            }
            catch { /* swallow email failures for registration flow */ }
        });

        return Result<AuthResponseDto>.SuccessResult(tokens, "Registration successful. Please verify your email.");
    }

    private AuthResponseDto GenerateTokens(User user)
    {
        var roles = new List<string> { "Customer" };
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _tokenService.GetAccessTokenExpiry()
        };
    }
}
