using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Data;
using System.Linq;

namespace Quanlyphongtro.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Landlord")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public DashboardController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet("Overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalRooms = await dbContext.Rooms.CountAsync();
            var rentedRooms = await dbContext.Rooms.CountAsync(r => r.Status == "Rented" || r.Status == "Đang thuê");
            var emptyRooms = totalRooms - rentedRooms;

            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;


            var currentMonthRevenue = await dbContext.Invoices
                .Where(i => i.InvoiceMonth == currentMonth && i.InvoiceYear == currentYear && i.Status == "Paid")
                .SumAsync(i => i.TotalAmount);


            var unpaidDebt = await dbContext.Invoices
                .Where(i => i.Status == "Unpaid" || i.Status == "Overdue")
                .SumAsync(i => i.TotalAmount);


            var last6Months = Enumerable.Range(0, 6).Select(i => 
            {
                var d = DateTime.UtcNow.AddMonths(-i);
                return new { Month = d.Month, Year = d.Year };
            }).ToList();

            var monthlyRevenue = new List<object>();
            foreach (var m in last6Months)
            {
                var rev = await dbContext.Invoices
                    .Where(i => i.InvoiceMonth == m.Month && i.InvoiceYear == m.Year && i.Status == "Paid")
                    .SumAsync(i => i.TotalAmount);
                monthlyRevenue.Add(new { m.Month, m.Year, Revenue = rev });
            }

            return Ok(new
            {
                TotalRooms = totalRooms,
                RentedRooms = rentedRooms,
                EmptyRooms = emptyRooms,
                CurrentMonthRevenue = currentMonthRevenue,
                UnpaidDebt = unpaidDebt,
                MonthlyRevenueChart = monthlyRevenue
            });
        }
    }
}
