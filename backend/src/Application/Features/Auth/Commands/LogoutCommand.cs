using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record LogoutCommand : IRequest<Result>;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public LogoutCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.UserId.HasValue)
            return Result.FailureResult("Not authenticated.");

        var user = await _context.Users.GetByIdAsync(_currentUser.UserId.Value, cancellationToken);
        if (user == null)
            return Result.FailureResult("User not found.");

        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Logged out successfully.");
    }
}
