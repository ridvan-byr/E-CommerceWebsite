namespace backend.DTOs;

public interface IAuditable
{
    int? CreatedByUserId { get; set; }
    string? CreatedBy { get; set; }
    int? UpdatedByUserId { get; set; }
    string? UpdatedBy { get; set; }
}
