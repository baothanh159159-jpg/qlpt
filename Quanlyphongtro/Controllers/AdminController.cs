using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models.Entity;
using System.Security.Claims;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AdminController(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? query = null)
        {
            var q = _db.Users.AsQueryable();
            if (!string.IsNullOrEmpty(query))
                q = q.Where(u => u.Email.Contains(query));

            var users = await q
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.ApprovalStatus,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("ChangeRole/{userId}")]
        public async Task<IActionResult> ChangeRole(Guid userId, [FromBody] ChangeRoleDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
            if (user.Role == "Admin") return BadRequest(new { message = "Không thể thay đổi role của Admin." });

            var validRoles = new[] { "Landlord", "Tenant" };
            if (!validRoles.Contains(dto.Role))
                return BadRequest(new { message = "Role không hợp lệ. Chỉ chấp nhận: Landlord, Tenant." });

            user.Role = dto.Role;
            await _db.SaveChangesAsync();
            return Ok(new { message = $"Đã đổi role thành {dto.Role} thành công!" });
        }

        [HttpPut("ToggleBan/{userId}")]
        public async Task<IActionResult> ToggleBan(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });
            if (user.Role == "Admin") return BadRequest(new { message = "Không thể khóa tài khoản Admin." });

            user.IsActive = !user.IsActive;
            await _db.SaveChangesAsync();

            string status = user.IsActive ? "mở khóa" : "khóa";
            return Ok(new { message = $"Đã {status} tài khoản thành công!", isActive = user.IsActive });
        }

        [HttpPut("ApproveUser/{userId}")]
        public async Task<IActionResult> ApproveUser(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            user.ApprovalStatus = "Approved";
            user.IsActive = true;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt tài khoản thành công!" });
        }

        [HttpPut("RejectUser/{userId}")]
        public async Task<IActionResult> RejectUser(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            user.ApprovalStatus = "Rejected";
            user.IsActive = false;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối tài khoản." });
        }

        [HttpPut("ResetPassword/{userId}")]
        public async Task<IActionResult> ResetPassword(Guid userId, [FromBody] ResetPasswordDto? dto = null)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            string newPassword = dto?.NewPassword ?? "Reset@123";
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = $"Đã reset mật khẩu về: {newPassword}" });
        }

        [HttpGet("Stats")]
        public async Task<IActionResult> GetStats()
        {
            var total = await _db.Users.CountAsync();
            var landlords = await _db.Users.CountAsync(u => u.Role == "Landlord");
            var tenants = await _db.Users.CountAsync(u => u.Role == "Tenant");
            var banned = await _db.Users.CountAsync(u => !u.IsActive);
            var pending = await _db.Users.CountAsync(u => u.ApprovalStatus == "Pending");

            return Ok(new { total, landlords, tenants, banned, pending });
        }
    }

    public class ChangeRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string? NewPassword { get; set; }
    }
}
