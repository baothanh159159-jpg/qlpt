using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Quanlyphongtro.Models.Entity
{
    public class Utility
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Room")]
        public Guid RoomId { get; set; }

        [Required]
        [Range(1, 12)]
        public int RecordMonth { get; set; }

        [Required]
        public int RecordYear { get; set; }

        [Required]
        public int ElectricityOld { get; set; }

        [Required]
        public int ElectricityNew { get; set; }

        [Required]
        public int WaterOld { get; set; }

        [Required]
        public int WaterNew { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Room? Room { get; set; }
    }
}
