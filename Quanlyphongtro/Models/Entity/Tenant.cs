using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;

namespace Quanlyphongtro.Models.Entity
{
    public class Tenant
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
        public ICollection<Contract>? Contracts { get; set; }
        public ICollection<Payment>? Payments { get; set; }
    }
}
