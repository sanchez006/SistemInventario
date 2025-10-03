using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration config, AppDbContext context, ILogger<AuthController> logger)
        {
            _config = config;
            _context = context;
            _logger = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
    public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Nombre))
            {
                return BadRequest("Username, Password y Nombre son obligatorios.");
            }

            bool exists = _context.Usuarios.Any(u => u.Username == request.Username);
            if (exists)
            {
                return Conflict("El nombre de usuario ya existe.");
            }

            // Determine role: default "Usuario". Allow "Admin" only if caller is admin or if it's the first user (bootstrap).
            string roleToAssign = "Usuario";
            bool noUsersYet = !_context.Usuarios.Any();
            bool callerIsAdmin = User?.IsInRole("Admin") == true;
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var requested = request.Role.Trim();
                if (string.Equals(requested, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    if (callerIsAdmin || noUsersYet)
                    {
                        roleToAssign = "Admin";
                    }
                }
                else if (string.Equals(requested, "Usuario", StringComparison.OrdinalIgnoreCase))
                {
                    roleToAssign = "Usuario";
                }
            }

            var user = new Usuario
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Nombre = request.Nombre,
                CreadoEn = DateTime.UtcNow,
                Rol = roleToAssign
            };

            _context.Usuarios.Add(user);
            _context.SaveChanges();

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

    [HttpPost("login")]
    [AllowAnonymous]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var normalized = (request.Username ?? string.Empty).Trim();
            var user = _context.Usuarios.FirstOrDefault(u => u.Username.ToLower() == normalized.ToLower());
            if (user == null)
            {
                _logger.LogWarning("Login failed: user not found for {Username}", normalized);
                return Unauthorized();
            }

            bool passwordMatches = false;
            // Try bcrypt verify first
            try
            {
                passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password ?? string.Empty, user.PasswordHash ?? string.Empty);
            }
            catch
            {
                passwordMatches = false;
            }
            // Legacy plaintext fallback: if stored hash equals provided password, upgrade to bcrypt
            var storedPlain = (user.PasswordHash ?? string.Empty).Trim();
            var incomingPlain = (request.Password ?? string.Empty).Trim();
            if (!passwordMatches && storedPlain == incomingPlain)
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(incomingPlain);
                _context.SaveChanges();
                passwordMatches = true;
            }

            if (!passwordMatches)
            {
                _logger.LogWarning("Login failed: bad password for {Username}", normalized);
                return Unauthorized();
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(Usuario user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim("id", user.Id.ToString()),
                new Claim("nombre", user.Nombre),
                new Claim(ClaimTypes.Role, user.Rol)
            };
            var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("Jwt:Key no configurado");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        
    }

    public class LoginRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Nombre { get; set; }
        public string? Role { get; set; }
    }
}
