using Domain.Entities;

namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user, IList<string> roles);
    string GenerateRefreshToken();
    string GenerateEmailVerificationToken();
    string GeneratePasswordResetToken();
    DateTime GetAccessTokenExpiry();
}
