using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Auth.Commands;

public record VerifyEmailCommand(string Token) : IRequest<Result>;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public VerifyEmailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = (await _context.Users
            .GetByExpressionAsync(u => u.EmailVerificationToken == request.Token, cancellationToken))
            .FirstOrDefault();

        if (user == null)
            return Result.FailureResult("Invalid verification token.");

        if (user.IsEmailVerified)
            return Result.SuccessResult("Email is already verified.");

        if (user.EmailVerificationTokenExpiry.HasValue && user.EmailVerificationTokenExpiry.Value < DateTime.UtcNow)
            return Result.FailureResult("Verification token has expired. Please request a new one.");

        user.IsEmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiry = null;

        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Email verified successfully.");
    }
}
