using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken)
    : IRequest<Result<AuthResponseDto>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = (await _context.Users
            .GetByExpressionAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken))
            .FirstOrDefault();

        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            return Result<AuthResponseDto>.FailureResult("Invalid or expired refresh token.");

        var userRoles = (await _context.Roles
            .GetByExpressionAsync(r => r.UserRoles.Any(ur => ur.UserId == user.Id), cancellationToken))
            .Select(r => r.Name).ToList();

        if (userRoles.Count == 0)
            userRoles = new List<string> { "Customer" };

        var accessToken = _tokenService.GenerateAccessToken(user, userRoles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result<AuthResponseDto>.SuccessResult(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = _tokenService.GetAccessTokenExpiry()
        });
    }
}
