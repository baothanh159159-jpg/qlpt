using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Contracts;

namespace Quanlyphongtro.Models.Entity
{
    public class Room
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(20)]
        public string RoomCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, 1000)]
        public double Area { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Available";

        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Contract>? Contracts { get; set; }
        public ICollection<Utility>? Utilities { get; set; }
        public ICollection<Invoice>? Invoices { get; set; }
        public ICollection<RoomImage>? Images { get; set; }
    }
}
