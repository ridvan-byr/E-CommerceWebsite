namespace backend.DTOs;

public class CategoryResponseDto : IAuditable
{
   public int CategoryId { get; set; }
   public string Name { get; set; } = string.Empty;
   public int ProductCount {get; set;}
   public bool IsDeleted { get; set; }
   public int? CreatedByUserId { get; set; }
   public string? CreatedBy { get; set; }
   public DateTime CreatedAt { get; set; }
   public int? UpdatedByUserId { get; set; }
   public string? UpdatedBy { get; set; }
   public DateTime? UpdatedAt { get; set; }
}
