using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class ProductFeatureConstraints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductFeatures_ProductId",
                table: "ProductFeatures");

            migrationBuilder.AlterColumn<string>(
                name: "Value",
                table: "ProductFeatures",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_ProductFeatures_ProductId_FeatureId",
                table: "ProductFeatures",
                columns: new[] { "ProductId", "FeatureId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductFeatures_ProductId_FeatureId",
                table: "ProductFeatures");

            migrationBuilder.AlterColumn<string>(
                name: "Value",
                table: "ProductFeatures",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateIndex(
                name: "IX_ProductFeatures_ProductId",
                table: "ProductFeatures",
                column: "ProductId");
        }
    }
}
