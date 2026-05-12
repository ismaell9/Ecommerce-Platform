using Application.Common;
using Application.Features.Auth.Queries;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record UpdateProfileCommand(
    string FirstName,
    string LastName,
    string? PhoneNumber) : IRequest<Result<CurrentUserDto>>;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<CurrentUserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateProfileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CurrentUserDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var user = await _context.Users.GetByIdAsync(userId, cancellationToken)
            ?? throw new Domain.Exceptions.NotFoundException("User", userId);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        var roles = (await _context.Roles
            .GetByExpressionAsync(r => r.UserRoles.Any(ur => ur.UserId == user.Id), cancellationToken))
            .Select(r => r.Name).ToList();

        return Result<CurrentUserDto>.SuccessResult(new CurrentUserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            IsEmailVerified = user.IsEmailVerified,
            Roles = roles,
            CreatedAt = user.CreatedAt
        });
    }
}
