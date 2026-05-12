using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword) : IRequest<Result>;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ChangePasswordCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var user = await _context.Users.GetByIdAsync(userId, cancellationToken)
            ?? throw new Domain.Exceptions.NotFoundException("User", userId);

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return Result.FailureResult("Current password is incorrect.");

        if (request.NewPassword != request.ConfirmNewPassword)
            return Result.FailureResult("New passwords do not match.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Password changed successfully.");
    }
}
