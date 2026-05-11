using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models
{
    public class ThemTenantDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = "Tenant@123";

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Address { get; set; }
    }
}
