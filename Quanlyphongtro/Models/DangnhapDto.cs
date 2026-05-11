using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class DangnhapDto
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;
    }
}
