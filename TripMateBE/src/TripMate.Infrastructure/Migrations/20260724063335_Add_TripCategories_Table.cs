using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_TripCategories_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_trip_categories_slug",
                table: "trip_categories");

            migrationBuilder.DropColumn(
                name: "icon_url",
                table: "trip_categories");

            migrationBuilder.AddColumn<string>(
                name: "icon",
                table: "trip_categories",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_trip_categories_slug",
                table: "trip_categories",
                column: "slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_trip_categories_slug",
                table: "trip_categories");

            migrationBuilder.DropColumn(
                name: "icon",
                table: "trip_categories");

            migrationBuilder.AddColumn<string>(
                name: "icon_url",
                table: "trip_categories",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_trip_categories_slug",
                table: "trip_categories",
                column: "slug",
                unique: true,
                filter: "[is_deleted] = 0");
        }
    }
}
