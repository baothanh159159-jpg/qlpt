using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quanlyphongtro.Models.Entity
{
    public class Contract
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Room")]
        public Guid RoomId { get; set; }

        [Required]
        [ForeignKey("Tenant")]
        public Guid TenantId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DepositAmount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Room? Room { get; set; }
        public Tenant? Tenant { get; set; }
        public ICollection<Invoice>? Invoices { get; set; }
    }
}
