namespace backend.DTOs;

public class CategoryResponseDto
{
   public int CategoryId { get; set; }
   public string Name { get; set; } = string.Empty;
   public string? Description { get; set; }
   public string? ImageUrl { get; set; }
   public int ProductCount {get; set;}
   public bool IsDeleted { get; set; }
   public string? CreatedBy { get; set; }
   public DateTime CreatedAt { get; set; }
   public string? UpdatedBy { get; set; }
   public DateTime? UpdatedAt { get; set; }
};