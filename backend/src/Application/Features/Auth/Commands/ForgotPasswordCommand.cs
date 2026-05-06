using Application.Common;
using Application.Interfaces;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.Auth.Commands;

public record ForgotPasswordCommand(string Email) : IRequest<Result>;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = (await _context.Users
            .GetByExpressionAsync(u => u.Email == request.Email.ToLower(), cancellationToken))
            .FirstOrDefault();

        // Always return success to prevent email enumeration
        if (user == null)
            return Result.SuccessResult("If the email exists, a reset link has been sent.");

        var token = _tokenService.GeneratePasswordResetToken();
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _context.UnitOfWork.SaveChangesAsync(cancellationToken);

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email, token, cancellationToken);
            }
            catch { /* swallow */ }
        });

        return Result.SuccessResult("If the email exists, a reset link has been sent.");
    }
}
