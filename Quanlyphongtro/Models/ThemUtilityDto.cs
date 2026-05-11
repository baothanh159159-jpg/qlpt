using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class ThemUtilityDto
    {
        [Required]
        public Guid RoomId { get; set; }

        [Required]
        [Range(1, 12)]
        public int RecordMonth { get; set; }

        [Required]
        public int RecordYear { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ElectricityOld { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int ElectricityNew { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int WaterOld { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int WaterNew { get; set; }
    }
}
