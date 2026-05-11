using Microsoft.EntityFrameworkCore;
using Quanlyphongtro.Models.Entity;

namespace Quanlyphongtro.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Utility> Utilities { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Tenant>()
                .HasIndex(t => t.PhoneNumber)
                .IsUnique();

            modelBuilder.Entity<Room>()
                .HasIndex(r => r.RoomCode)
                .IsUnique();

            modelBuilder.Entity<RoomImage>()
                .HasOne(i => i.Room)
                .WithMany(r => r.Images)
                .HasForeignKey(i => i.RoomId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Tenant>()
                .HasOne(t => t.User)
                .WithOne(u => u.Tenant)
                .HasForeignKey<Tenant>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Tenant)
                .WithMany(t => t.Payments)
                .HasForeignKey(p => p.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Room)
                .WithMany(r => r.Invoices)
                .HasForeignKey(i => i.RoomId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Contract)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.ContractId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Utility>()
                .HasOne(u => u.Room)
                .WithMany(r => r.Utilities)
                .HasForeignKey(u => u.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
