using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class ThemContractDto
    {
        [Required]
        public Guid RoomId { get; set; }

        [Required]
        public Guid TenantId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public decimal DepositAmount { get; set; }
    }
}
