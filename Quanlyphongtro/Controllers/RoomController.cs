using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models;
using Quanlyphongtro.Models.Entity;
using System.Net.NetworkInformation;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        public RoomController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        [HttpGet("GetAllRooms")]
        public async Task<IActionResult> GetAllRooms(
            [FromQuery] string? query,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? status,
            [FromQuery] string? sortByPrice,
            [FromQuery] string? sortByArea)
        {
            var queryable = dbContext.Rooms.Include(r => r.Images).AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                queryable = queryable.Where(r => r.RoomCode.Contains(query) || r.Name.Contains(query));
            }
            if (minPrice.HasValue)
            {
                queryable = queryable.Where(r => r.Price >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                queryable = queryable.Where(r => r.Price <= maxPrice.Value);
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                queryable = queryable.Where(r => r.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(sortByPrice))
            {
                queryable = sortByPrice.ToLower() == "desc" ? queryable.OrderByDescending(r => r.Price) : queryable.OrderBy(r => r.Price);
            }
            else if (!string.IsNullOrWhiteSpace(sortByArea))
            {
                queryable = sortByArea.ToLower() == "desc" ? queryable.OrderByDescending(r => r.Area) : queryable.OrderBy(r => r.Area);
            }

            var rooms = await queryable.ToListAsync();
            return Ok(rooms);
        }

        [HttpGet("GetRoom/{roomcode}")]
        public async Task<IActionResult> GetRoomById(string roomcode)
        {
            var room = await dbContext.Rooms.Include(r => r.Images).FirstOrDefaultAsync(r => r.RoomCode == roomcode);
            if(room == null) return NotFound(new { message = "Không tìm thấy phòng."});
            return Ok(room);
        }

        [HttpPost("AddRoom")]
        public async Task<IActionResult> AddNewRoom(ThemRoomDto themRoomDto)
        {
            var roomEntity =  new Room()
            {
                RoomCode = themRoomDto.RoomCode,
                Name = themRoomDto.Name,
                Area = themRoomDto.Area,
                Price = themRoomDto.Price,
                Status = themRoomDto.Status,
                Description = themRoomDto.Description,
                Address = themRoomDto.Address,
                Images = themRoomDto.Images != null ? themRoomDto.Images.Select(url => new RoomImage { ImageUrl = url }).ToList() : null,
                CreatedAt = DateTime.UtcNow
            };

            await dbContext.Rooms.AddAsync(roomEntity);
            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Thêm mới phòng thành công!", roomcode = roomEntity.RoomCode, name = roomEntity.Name });
        }


        [HttpDelete("DeleteRoom/{roomcode}")]
        public async Task<IActionResult> DeleteRoom (String roomcode)
        {
            var room = await dbContext.Rooms.FirstOrDefaultAsync(u => u.RoomCode == roomcode);
            if (room == null)
            {
                return NotFound(new {message = "Không tìm thấy phòng muốn xoá có trong hệ thống!"});
            }

            var hasContracts = await dbContext.Contracts.AnyAsync(c => c.RoomId == room.Id);
            var hasInvoices = await dbContext.Invoices.AnyAsync(i => i.RoomId == room.Id);
            var hasUtilities = await dbContext.Utilities.AnyAsync(u => u.RoomId == room.Id);

            if (hasContracts || hasInvoices || hasUtilities)
            {
                return BadRequest(new { message = "Lỗi Ràng Buộc: Phòng này đã có Hợp đồng / Hóa Đơn / Điện Nước. Hãy dọn dẹp các khoản kể trên trước khi xóa hẳn mã Phòng." });
            }

            dbContext.Rooms.Remove(room);
            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Xóa phòng thành công." });
        }


        [HttpPut("UpdateRoom/{roomcode}")]
        public async Task<IActionResult> UpdateRoom(String roomcode, CapNhapRoomDto capNhapRoomDto)
        {
            var room = await dbContext.Rooms.FirstOrDefaultAsync(u => u.RoomCode == roomcode);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng cần cập nhập thông tin!" });
            }
            room.Name = capNhapRoomDto.Name;
            room.Area = capNhapRoomDto.Area;
            room.Price = capNhapRoomDto.Price;
            room.Status = capNhapRoomDto.Status;
            room.Description = capNhapRoomDto.Description;
            room.Address = capNhapRoomDto.Address;

            if (capNhapRoomDto.Images != null)
            {
                var existingImages = await dbContext.RoomImages.Where(i => i.RoomId == room.Id).ToListAsync();
                dbContext.RoomImages.RemoveRange(existingImages);

                var newImages = capNhapRoomDto.Images.Select(url => new RoomImage { RoomId = room.Id, ImageUrl = url }).ToList();
                await dbContext.RoomImages.AddRangeAsync(newImages);
            }

            await dbContext.SaveChangesAsync();


            return Ok(new { message = "Đã cập nhập thông tin phòng thành công" });
        }

        [HttpPost("UploadImages")]
        public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files)
        {
            if (files == null || files.Count == 0) return BadRequest("Không có file nào được tải lên.");
            var urls = new List<string>();
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "rooms");
            if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

            foreach (var file in files)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadDir, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
                urls.Add($"{baseUrl}/uploads/rooms/{fileName}");
            }
            return Ok(new { urls });
        }
    }
}
