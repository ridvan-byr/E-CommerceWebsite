using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AuditUserIdsOnFeatureProductFeaturePrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "ProductPrices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "ProductFeatures",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "ProductFeatures",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Features",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedByUserId",
                table: "Features",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ProductPrices");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ProductFeatures");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ProductFeatures");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Features");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Features");
        }
    }
}
