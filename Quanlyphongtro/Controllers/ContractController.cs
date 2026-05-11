using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models;
using Quanlyphongtro.Models.Entity;
using System.Security.Claims;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public ContractController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [Authorize(Roles = "Landlord")]
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllContracts()
        {
            var contracts = await dbContext.Contracts
                .Include(c => c.Room)
                .Include(c => c.Tenant)
                .Select(c => new {
                    c.Id,
                    RoomCode = c.Room != null ? c.Room.RoomCode : "",
                    RoomName = c.Room != null ? c.Room.Name : "",
                    TenantName = c.Tenant != null ? c.Tenant.FullName : "",
                    c.StartDate,
                    c.EndDate,
                    c.DepositAmount,
                    c.Status,
                    c.CreatedAt
                })
                .ToListAsync();
            return Ok(contracts);
        }

        [Authorize(Roles = "Landlord")]
        [HttpPost("Add")]
        public async Task<IActionResult> AddContract(ThemContractDto dto)
        {
            var room = await dbContext.Rooms.FindAsync(dto.RoomId);
            if (room == null) return NotFound(new { message = "Phòng không tồn tại." });

            if (room.Status != "Available" && room.Status != "Trống")
            {
                return BadRequest(new { message = "Phòng này không trống." });
            }

            var tenant = await dbContext.Tenants.FindAsync(dto.TenantId);
            if (tenant == null) return NotFound(new { message = "Người thuê không tồn tại." });

            if (dto.EndDate <= dto.StartDate)
                return BadRequest(new { message = "Ngày kết thúc phải lớn hơn ngày bắt đầu." });

            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var contract = new Contract
                {
                    RoomId = dto.RoomId,
                    TenantId = dto.TenantId,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    DepositAmount = dto.DepositAmount,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                await dbContext.Contracts.AddAsync(contract);


                room.Status = "Rented";

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Tạo hợp đồng thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [Authorize(Roles = "Landlord")]
        [HttpPut("EndContract/{id}")]
        public async Task<IActionResult> EndContract(Guid id)
        {
            var contract = await dbContext.Contracts.Include(c => c.Room).FirstOrDefaultAsync(c => c.Id == id);
            if (contract == null) return NotFound(new { message = "Hợp đồng không tồn tại." });

            if (contract.Status == "Inactive")
                return BadRequest(new { message = "Hợp đồng đã kết thúc." });

            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                contract.Status = "Inactive";
                
                if (contract.Room != null)
                {
                    contract.Room.Status = "Available"; 
                }

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Đã kết thúc hợp đồng thành công." });
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [Authorize(Roles = "Tenant")]
        [HttpPost("RequestContract")]
        public async Task<IActionResult> RequestContract(RequestContractDto dto)
        {
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var room = await dbContext.Rooms.FindAsync(dto.RoomId);
            if (room == null || (room.Status != "Available" && room.Status != "Trống"))
                return BadRequest(new { message = "Phòng không tồn tại hoặc không trống." });

            var tenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null)
            {
                tenant = new Tenant
                {
                    UserId = userId,
                    FullName = dto.FullName,
                    PhoneNumber = dto.PhoneNumber,
                    Address = dto.Address,
                    CreatedAt = DateTime.UtcNow
                };
                await dbContext.Tenants.AddAsync(tenant);
                await dbContext.SaveChangesAsync(); 
            }

            var existingPending = await dbContext.Contracts.AnyAsync(c => c.RoomId == dto.RoomId && c.TenantId == tenant.Id && c.Status == "Pending");
            if (existingPending) return BadRequest(new { message = "Bạn đã gửi yêu cầu thuê phòng này rồi, vui lòng đợi duyệt!" });

            var contract = new Contract
            {
                RoomId = dto.RoomId,
                TenantId = tenant.Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(6),
                DepositAmount = 0,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            await dbContext.Contracts.AddAsync(contract);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Gửi yêu cầu thuê phòng thành công. Chủ trọ sẽ liên hệ và duyệt hợp đồng sớm nhất!" });
        }

        [Authorize(Roles = "Landlord")]
        [HttpPut("ApproveContract/{id}")]
        public async Task<IActionResult> ApproveContract(Guid id, [FromBody] ThemContractDto dto)
        {
            var contract = await dbContext.Contracts.Include(c => c.Room).FirstOrDefaultAsync(c => c.Id == id);
            if (contract == null || contract.Status != "Pending") return NotFound(new { message = "Không tìm thấy yêu cầu hợp đồng hợp lệ." });

            if (contract.Room != null && contract.Room.Status != "Available" && contract.Room.Status != "Trống")
            {
                return BadRequest(new { message = "Phòng này đã được thuê bởi người khác." });
            }

            contract.StartDate = dto.StartDate;
            contract.EndDate = dto.EndDate;
            contract.DepositAmount = dto.DepositAmount;
            contract.Status = "Active";

            if (contract.Room != null) {
                contract.Room.Status = "Rented";
            }

            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt và kích hoạt hợp đồng!" });
        }
    }
}
