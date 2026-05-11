using System.ComponentModel.DataAnnotations;

namespace Quanlyphongtro.Models.Entity
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng chọn vai trò (Role) khi đăng ký")]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;
        
        public string ApprovalStatus { get; set; } = "Approved";

        public bool IsActive { get; set; } = true;

        [MaxLength(50)]
        public string? BankCode { get; set; }

        [MaxLength(50)]
        public string? BankAccountNumber { get; set; }

        [MaxLength(100)]
        public string? BankAccountName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Tenant? Tenant { get; set; }
    }
}
