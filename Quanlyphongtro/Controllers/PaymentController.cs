using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models.Entity;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public PaymentController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [Authorize(Roles = "Tenant,Landlord")]
        [HttpPost("Pay/{invoiceId}")]
        public async Task<IActionResult> PayInvoice(Guid invoiceId)
        {
            var invoice = await dbContext.Invoices.Include(i => i.Contract).FirstOrDefaultAsync(i => i.Id == invoiceId);
            if (invoice == null) return NotFound(new { message = "Không tìm thấy hóa đơn." });

            if (invoice.Status == "Paid")
                return BadRequest(new { message = "Hóa đơn này đã được thanh toán." });

            if (invoice.Contract == null)
                return BadRequest(new { message = "Hóa đơn lỗi, không thuộc hợp đồng nào." });

            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try {
                invoice.Status = "Paid";

                var payment = new Payment
                {
                    InvoiceId = invoiceId,
                    TenantId = invoice.Contract.TenantId,
                    Amount = invoice.TotalAmount,
                    PaymentMethod = "Online/Cash",
                    Status = "Success",
                    PaymentDate = DateTime.UtcNow
                };

                await dbContext.Payments.AddAsync(payment);
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Thanh toán thành công." });
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi " + ex.Message });
            }
        }

        [Authorize(Roles = "Landlord")]
        [HttpGet("History")]
        public async Task<IActionResult> GetHistory()
        {
            var payments = await dbContext.Payments
                .Include(p => p.Tenant)
                .Include(p => p.Invoice)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
            return Ok(payments);
        }
    }
}
