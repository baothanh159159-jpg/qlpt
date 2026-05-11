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
    public class UtilityController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public UtilityController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("GetByRoom/{roomId}")]
        public async Task<IActionResult> GetByRoom(Guid roomId)
        {
            var utilities = await dbContext.Utilities
                .Where(u => u.RoomId == roomId)
                .OrderByDescending(u => u.RecordYear)
                .ThenByDescending(u => u.RecordMonth)
                .ToListAsync();

            return Ok(utilities);
        }

        [HttpPost("AddUtility")]
        public async Task<IActionResult> AddUtility(ThemUtilityDto dto)
        {
            if (dto.ElectricityNew < dto.ElectricityOld)
                return BadRequest(new { message = "Chỉ số điện mới không thể nhỏ hơn chỉ số cũ." });
            if (dto.WaterNew < dto.WaterOld)
                return BadRequest(new { message = "Chỉ số nước mới không thể nhỏ hơn chỉ số cũ." });

            var roomExists = await dbContext.Rooms.AnyAsync(r => r.Id == dto.RoomId);
            if (!roomExists) return NotFound(new { message = "Phòng không tồn tại." });

            var existingRecord = await dbContext.Utilities
                .FirstOrDefaultAsync(u => u.RoomId == dto.RoomId && u.RecordMonth == dto.RecordMonth && u.RecordYear == dto.RecordYear);
            
            if (existingRecord != null)
                return BadRequest(new { message = "Chỉ số điện nước của tháng này đã được ghi nhận cho phòng này." });

            var utility = new Utility
            {
                RoomId = dto.RoomId,
                RecordMonth = dto.RecordMonth,
                RecordYear = dto.RecordYear,
                ElectricityOld = dto.ElectricityOld,
                ElectricityNew = dto.ElectricityNew,
                WaterOld = dto.WaterOld,
                WaterNew = dto.WaterNew,
                CreatedAt = DateTime.UtcNow
            };

            await dbContext.Utilities.AddAsync(utility);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Đã lưu chỉ số điện nước thành công!" });
        }
    }
}
