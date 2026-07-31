using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusToTripMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "trip_members",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "trip_members");
        }
    }
}
