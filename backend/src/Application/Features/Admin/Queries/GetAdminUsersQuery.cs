using Application.Common;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Admin.Queries;

public record GetAdminUsersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    string? Role = null) : IRequest<PaginatedResult<UserDto>>;

public class UserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsActive { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class GetAdminUsersQueryHandler : IRequestHandler<GetAdminUsersQuery, PaginatedResult<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<UserDto>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _context.Users.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate: u =>
                (string.IsNullOrEmpty(request.Search) ||
                 u.FirstName.Contains(request.Search) ||
                 u.LastName.Contains(request.Search) ||
                 u.Email.Contains(request.Search)),
            orderBy: q => q.OrderByDescending(u => u.CreatedAt),
            cancellationToken: cancellationToken);

        var dtos = new List<UserDto>();
        foreach (var user in users.Data)
        {
            var roles = (await _context.Roles
                .GetByExpressionAsync(r => r.UserRoles.Any(ur => ur.UserId == user.Id), cancellationToken))
                .Select(r => r.Name).ToList();

            if (!string.IsNullOrEmpty(request.Role) && !roles.Contains(request.Role))
                continue;

            dtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsEmailVerified = user.IsEmailVerified,
                IsActive = user.IsActive,
                Roles = roles,
                CreatedAt = user.CreatedAt
            });
        }

        return PaginatedResult<UserDto>.Create(dtos, users.TotalCount, users.CurrentPage, users.PageSize);
    }
}
