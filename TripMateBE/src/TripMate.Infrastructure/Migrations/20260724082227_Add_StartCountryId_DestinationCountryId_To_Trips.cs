using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TripMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_StartCountryId_DestinationCountryId_To_Trips : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DestinationCountryId",
                table: "trips",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StartCountryId",
                table: "trips",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DestinationCountryId",
                table: "trips");

            migrationBuilder.DropColumn(
                name: "StartCountryId",
                table: "trips");
        }
    }
}
