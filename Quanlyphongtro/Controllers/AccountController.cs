using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models;
using BCrypt.Net;

using Quanlyphongtro.Models.Entity;
using Org.BouncyCastle.Crypto.Generators;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IConfiguration _config;
        public AccountController(ApplicationDbContext dbContext, IConfiguration config)
        {
            this.dbContext = dbContext;
            _config = config;
        }


        [HttpPost("Dangki")]
        public async Task<IActionResult> DangKi(ThemUserDto themUserDto)
        {
            var existing = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == themUserDto.Email);
            if (existing != null)
                return BadRequest(new { message = "Email này đã tồn tại, vui lòng dùng email khác!" });

            
            bool isLandlord = themUserDto.Role == "Landlord";
            var userEntity = new User
            {
                Email = themUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(themUserDto.Password),
                Role = themUserDto.Role,
                IsActive = !isLandlord,   
                ApprovalStatus = isLandlord ? "Pending" : "Approved",
                CreatedAt = DateTime.UtcNow
            };

            await dbContext.Users.AddAsync(userEntity);
            await dbContext.SaveChangesAsync();

            string msg = isLandlord
                ? "Đăng ký thành công! Tài khoản Chủ Trọ đang chờ Admin duyệt."
                : "Đăng ký tài khoản thành công!";
            return Ok(new { message = msg, email = userEntity.Email, role = userEntity.Role, approvalStatus = userEntity.ApprovalStatus });
        }

        [HttpPost("Dangnhap")]
        public async Task<IActionResult> DangNhap(DangnhapDto dangnhapDto)
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == dangnhapDto.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Email không tồn tại !!! " });
            }
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dangnhapDto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return BadRequest(new { message = "Email hoặc mật khẩu không chính xác!" });
            }

            if (!user.IsActive)
                return BadRequest(new { message = "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!" });

            if (user.ApprovalStatus == "Pending")
                return BadRequest(new { message = "Tài khoản Chủ Trọ của bạn đang chờ Admin duyệt. Vui lòng đợi!" });

            if (user.ApprovalStatus == "Rejected")
                return BadRequest(new { message = "Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ Admin." });

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _config["Jwt:Key"];
            if(string.IsNullOrEmpty(jwtKey)){
                return StatusCode(500, new { message = "Missing JWT Key configuration." });
            }
            var key = Encoding.UTF8.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("IsActive", user.IsActive.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            return Ok(new { message = "Đăng nhập thành công" ,
                email = user.Email,
                role = user.Role,
                token = jwtToken
            });
        }

        [Authorize]
        [HttpGet("Me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var user = await dbContext.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new {
                user.Id,
                user.Email,
                user.Role,
                user.BankCode,
                user.BankAccountNumber,
                user.BankAccountName
            });
        }

        [Authorize(Roles = "Landlord")]
        [HttpPut("UpdateBankInfo")]
        public async Task<IActionResult> UpdateBankInfo(UpdateBankDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var user = await dbContext.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.BankCode = dto.BankCode;
            user.BankAccountNumber = dto.BankAccountNumber;
            user.BankAccountName = dto.BankAccountName;

            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Cập nhật cấu hình VietQR Ngân hàng thành công!"});
        }

        [Authorize(Roles = "Landlord,Admin")]
        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await dbContext.Users
                .Select(u => new { u.Id, u.Email, u.Role, u.IsActive, u.ApprovalStatus, u.CreatedAt })
                .ToListAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Landlord,Admin")]
        [HttpGet("Search")]
        public async Task<IActionResult> SearchUser([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Vui lòng nhập email để tìm kiếm" });

            var users = await dbContext.Users
                .Where(u => u.Email.Contains(query))
                .Select(u => new { u.Id, u.Email, u.Role, u.IsActive, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }

    }
}
