using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_IdentityCardNumber_And_HostVerificationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "host_verification_status",
                table: "users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "identity_card_number",
                table: "users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "host_verification_status",
                table: "users");

            migrationBuilder.DropColumn(
                name: "identity_card_number",
                table: "users");
        }
    }
}
