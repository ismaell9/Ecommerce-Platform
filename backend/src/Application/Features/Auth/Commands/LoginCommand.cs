using Application.Common;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password)
    : IRequest<Result<AuthResponseDto>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = (await _context.Users
            .GetByExpressionAsync(u => u.Email == request.Email.ToLower(), cancellationToken))
            .FirstOrDefault();

        if (user == null)
            return Result<AuthResponseDto>.FailureResult("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result<AuthResponseDto>.FailureResult("Invalid email or password.");

        if (!user.IsActive)
            return Result<AuthResponseDto>.FailureResult("Your account has been disabled.");

        var userRoles = (await _context.Roles
            .GetByExpressionAsync(r => r.UserRoles.Any(ur => ur.UserId == user.Id), cancellationToken))
            .Select(r => r.Name).ToList();

        if (userRoles.Count == 0)
            userRoles = new List<string> { "Customer" };

        var accessToken = _tokenService.GenerateAccessToken(user, userRoles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.SuccessResult(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = _tokenService.GetAccessTokenExpiry()
        });
    }
}
