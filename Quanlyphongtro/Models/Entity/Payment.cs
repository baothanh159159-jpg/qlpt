using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quanlyphongtro.Models.Entity
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Invoice")]
        public Guid InvoiceId { get; set; }

        [Required]
        [ForeignKey("Tenant")]
        public Guid TenantId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Cash"; // Cash, BankTransfer...

        [MaxLength(20)]
        public string Status { get; set; } = "Success"; // Success, Failed

        // Navigation properties
        public Invoice? Invoice { get; set; }
        public Tenant? Tenant { get; set; }
    }
}
