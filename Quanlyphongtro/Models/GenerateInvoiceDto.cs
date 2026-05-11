using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class GenerateInvoiceDto
    {
        [Required]
        public Guid RoomId { get; set; }
        [Required]
        public int Month { get; set; }
        [Required]
        public int Year { get; set; }

        public int? ElectricityOld { get; set; }
        public int? ElectricityNew { get; set; }
        public int? WaterOld { get; set; }
        public int? WaterNew { get; set; }

        public decimal? ElectricPrice { get; set; }
        public decimal? WaterPrice { get; set; }
    }
}
