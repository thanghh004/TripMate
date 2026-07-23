using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_TripCategory_And_StartLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "category",
                table: "trips");

            migrationBuilder.AddColumn<Guid>(
                name: "category_id",
                table: "trips",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "start_location",
                table: "trips",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "trip_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    icon_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    display_order = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_categories", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_trips_category_id",
                table: "trips",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_trip_categories_slug",
                table: "trip_categories",
                column: "slug",
                unique: true,
                filter: "[is_deleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_trips_trip_categories_category_id",
                table: "trips",
                column: "category_id",
                principalTable: "trip_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_trips_trip_categories_category_id",
                table: "trips");

            migrationBuilder.DropTable(
                name: "trip_categories");

            migrationBuilder.DropIndex(
                name: "IX_trips_category_id",
                table: "trips");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "trips");

            migrationBuilder.DropColumn(
                name: "start_location",
                table: "trips");

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "trips",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
