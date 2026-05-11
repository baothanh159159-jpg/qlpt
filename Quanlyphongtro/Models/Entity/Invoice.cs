using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quanlyphongtro.Models.Entity
{
    public class Invoice
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Room")]
        public Guid RoomId { get; set; }

        [Required]
        [ForeignKey("Contract")]
        public Guid ContractId { get; set; }

        [Required]
        public int InvoiceMonth { get; set; }

        [Required]
        public int InvoiceYear { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal RoomFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ElectricityFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal WaterFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Unpaid"; // Unpaid, Paid, Overdue

        [Required]
        public DateTime DueDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Room? Room { get; set; }
        public Contract? Contract { get; set; }
        public ICollection<Payment>? Payments { get; set; }
    }
}
