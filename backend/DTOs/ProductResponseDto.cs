using System;
using System.Collections.Generic;

namespace backend.DTOs;

public class ProductResponseDto
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public bool IsDiscount { get; set; }
    public int Stock { get; set; }
    public string Status { get; set; } = "active";
    public string? ImageUrl { get; set; }
    public bool IsDeleted { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<ProductFeatureResponseDto>? Features { get; set; }
}
