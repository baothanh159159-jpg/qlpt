using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models;
using Quanlyphongtro.Models.Entity;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Landlord")]
    public class TenantController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public TenantController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllTenants()
        {
            var tenants = await dbContext.Tenants
                .Include(t => t.User)
                .Where(t => t.User == null || t.User.IsActive)
                .Select(t => new {
                    t.Id,
                    t.FullName,
                    t.PhoneNumber,
                    t.Address,
                    Email = t.User != null ? t.User.Email : "",
                    t.CreatedAt
                })
                .ToListAsync();
            return Ok(tenants);
        }

        [HttpGet("Search")]
        public async Task<IActionResult> SearchTenants([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Vui lòng nhập tên hoặc số điện thoại" });

            var tenants = await dbContext.Tenants
                .Include(t => t.User)
                .Where(t => (t.User == null || t.User.IsActive) && (t.FullName.Contains(query) || t.PhoneNumber.Contains(query)))
                .Select(t => new {
                    t.Id,
                    t.FullName,
                    t.PhoneNumber,
                    t.Address,
                    Email = t.User != null ? t.User.Email : "",
                    t.CreatedAt
                })
                .ToListAsync();

            return Ok(tenants);
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddTenant(ThemTenantDto dto)
        {

            var existingTenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.PhoneNumber == dto.PhoneNumber);
            if (existingTenant != null)
                return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });


            var existingUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email này đã được sử dụng." });

            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var newUser = new User
                {
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = "Tenant",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await dbContext.Users.AddAsync(newUser);
                await dbContext.SaveChangesAsync();

                var newTenant = new Tenant
                {
                    UserId = newUser.Id,
                    FullName = dto.FullName,
                    PhoneNumber = dto.PhoneNumber,
                    Address = dto.Address,
                    CreatedAt = DateTime.UtcNow
                };

                await dbContext.Tenants.AddAsync(newTenant);
                await dbContext.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Thêm người thuê và tạo tài khoản thành công!", tenantId = newTenant.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống khi thêm người thuê: " + ex.Message });
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> UpdateTenant(Guid id, CapNhapTenantDto dto)
        {
            var tenant = await dbContext.Tenants.FindAsync(id);
            if (tenant == null)
                return NotFound(new { message = "Không tìm thấy người thuê." });

            if (tenant.PhoneNumber != dto.PhoneNumber)
            {
                var phoneExists = await dbContext.Tenants.AnyAsync(t => t.PhoneNumber == dto.PhoneNumber);
                if (phoneExists)
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi người khác." });
            }

            tenant.FullName = dto.FullName;
            tenant.PhoneNumber = dto.PhoneNumber;
            tenant.Address = dto.Address;

            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteTenant(Guid id)
        {
            var tenant = await dbContext.Tenants.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == id);
            if (tenant == null)
                return NotFound(new { message = "Không tìm thấy người thuê." });

            var hasContracts = await dbContext.Contracts.AnyAsync(c => c.TenantId == id);
            
            if (hasContracts && tenant.User != null)
            {
                // Soft delete
                tenant.User.IsActive = false;
            }
            else
            {
                if (tenant.User != null) dbContext.Users.Remove(tenant.User);
                dbContext.Tenants.Remove(tenant);
            }

            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Đã thu hồi quyền quản lý và xóa hiển thị Khách!" });
        }
    }
}
