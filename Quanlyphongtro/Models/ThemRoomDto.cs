using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quanlyphongtro.Models
{
    public class ThemRoomDto
    {
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

        public List<string>? Images { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
