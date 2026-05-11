using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class ThemUserDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng chọn vai trò (Role) khi đăng ký")]
        [RegularExpression("^(Landlord|Tenant)$", ErrorMessage = "Vai trò không hợp lệ. Chỉ chấp nhận 'Landlord' hoặc 'Tenant'.")]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
