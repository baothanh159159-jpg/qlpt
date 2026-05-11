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
    public class InvoiceController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IConfiguration _config;

        public InvoiceController(ApplicationDbContext dbContext, IConfiguration config)
        {
            this.dbContext = dbContext;
            _config = config;
        }

        [Authorize(Roles = "Landlord")]
        [HttpPost("Generate")]
        public async Task<IActionResult> GenerateInvoice(GenerateInvoiceDto dto)
        {

            var contract = await dbContext.Contracts
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.RoomId == dto.RoomId && c.Status == "Active");

            if (contract == null)
                return BadRequest(new { message = "Không tìm thấy hợp đồng đang thuê cho phòng này." });


            var existingInvoice = await dbContext.Invoices
                .FirstOrDefaultAsync(i => i.RoomId == dto.RoomId && i.InvoiceMonth == dto.Month && i.InvoiceYear == dto.Year);
            if (existingInvoice != null)
                return BadRequest(new { message = "Hóa đơn tháng này đã được tạo." });


            var utility = await dbContext.Utilities
                .FirstOrDefaultAsync(u => u.RoomId == dto.RoomId && u.RecordMonth == dto.Month && u.RecordYear == dto.Year);

            if (utility == null && dto.ElectricityNew.HasValue && dto.WaterNew.HasValue) 
            {
               utility = new Utility {
                    RoomId = dto.RoomId,
                    RecordMonth = dto.Month,
                    RecordYear = dto.Year,
                    ElectricityOld = dto.ElectricityOld ?? 0,
                    ElectricityNew = dto.ElectricityNew.Value,
                    WaterOld = dto.WaterOld ?? 0,
                    WaterNew = dto.WaterNew ?? 0
               };
               dbContext.Utilities.Add(utility);
            }

            decimal electricPrice = dto.ElectricPrice ?? _config.GetValue<decimal>("Pricing:Electricity");
            decimal waterPrice = dto.WaterPrice ?? _config.GetValue<decimal>("Pricing:Water");

            decimal electricFee = 0;
            decimal waterFee = 0;

            if (utility != null)
            {
                electricFee = (utility.ElectricityNew - utility.ElectricityOld) * electricPrice;
                waterFee = (utility.WaterNew - utility.WaterOld) * waterPrice;
            }

            decimal roomFee = contract.Room.Price;
            decimal totalAmount = roomFee + electricFee + waterFee;

            var invoice = new Invoice
            {
                RoomId = dto.RoomId,
                ContractId = contract.Id,
                InvoiceMonth = dto.Month,
                InvoiceYear = dto.Year,
                RoomFee = roomFee,
                ElectricityFee = electricFee,
                WaterFee = waterFee,
                TotalAmount = totalAmount,
                Status = "Unpaid",
                DueDate = DateTime.UtcNow.AddDays(5),
                CreatedAt = DateTime.UtcNow
            };

            await dbContext.Invoices.AddAsync(invoice);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Tạo hóa đơn thành công", invoiceId = invoice.Id });
        }

        [Authorize(Roles = "Landlord")]
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> DeleteInvoice(Guid id)
        {
            var invoice = await dbContext.Invoices.FindAsync(id);
            if (invoice == null) return NotFound(new { message = "Không tìm thấy hóa đơn."});
            if (invoice.Status == "Paid") return BadRequest(new { message = "Không thể xóa hóa đơn đã thu tiền."});
            
            dbContext.Invoices.Remove(invoice);
            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Đã hủy bỏ hóa đơn."});
        }

        [Authorize(Roles = "Landlord")]
        [HttpGet("GetAllUnpaid")]
        public async Task<IActionResult> GetAllUnpaid()
        {
            var invoices = await dbContext.Invoices
                .Include(i => i.Room)
                .Where(i => i.Status == "Unpaid")
                .ToListAsync();
            return Ok(invoices);
        }

        [Authorize(Roles = "Tenant,Landlord")]
        [HttpGet("GetTenantInvoices/{contractId}")]
        public async Task<IActionResult> GetTenantInvoices(Guid contractId)
        {
            var invoices = await dbContext.Invoices
                .Where(i => i.ContractId == contractId)
                .OrderByDescending(i => i.InvoiceYear).ThenByDescending(i => i.InvoiceMonth)
                .ToListAsync();
            return Ok(invoices);
        }

        [Authorize(Roles = "Tenant,Landlord")]
        [HttpGet("GetByRoom/{roomId}")]
        public async Task<IActionResult> GetInvoicesByRoom(Guid roomId)
        {
            var invoices = await dbContext.Invoices
                .Include(i => i.Room)
                .Where(i => i.RoomId == roomId)
                .OrderByDescending(i => i.InvoiceYear).ThenByDescending(i => i.InvoiceMonth)
                .Select(i => new {
                    i.Id,
                    i.InvoiceMonth,
                    i.InvoiceYear,
                    i.RoomFee,
                    i.ElectricityFee,
                    i.WaterFee,
                    i.TotalAmount,
                    i.Status,
                    i.DueDate,
                    RoomName = i.Room.Name
                })
                .ToListAsync();
            return Ok(invoices);
        }

        [Authorize(Roles = "Tenant")]
        [HttpGet("MyInvoices")]
        public async Task<IActionResult> GetMyInvoices()
        {
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
                return Unauthorized();

            var tenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.UserId == userId);
            if (tenant == null) return Ok(new object[] { });

            var landlord = await dbContext.Users.FirstOrDefaultAsync(u => u.Role == "Landlord");
            
            var invoices = await dbContext.Invoices
                .Include(i => i.Contract)
                .Include(i => i.Room)
                .Where(i => i.Contract != null && i.Contract.TenantId == tenant.Id)
                .OrderByDescending(i => i.InvoiceYear).ThenByDescending(i => i.InvoiceMonth)
                .Select(i => new {
                    i.Id,
                    i.InvoiceMonth,
                    i.InvoiceYear,
                    i.RoomFee,
                    i.ElectricityFee,
                    i.WaterFee,
                    i.TotalAmount,
                    i.Status,
                    i.DueDate,
                    RoomName = i.Room != null ? i.Room.Name : "",
                    BankCode = landlord != null ? landlord.BankCode : "",
                    BankAccountNumber = landlord != null ? landlord.BankAccountNumber : "",
                    BankAccountName = landlord != null ? landlord.BankAccountName : ""
                })
                .ToListAsync();

            return Ok(invoices);
        }
    }
}
