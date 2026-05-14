using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quanlyphongtro.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Tenants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Tenants",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
