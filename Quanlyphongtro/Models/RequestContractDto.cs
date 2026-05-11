using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class RequestContractDto
    {
        [Required]
        public Guid RoomId { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        public string? Address { get; set; }
    }
}
